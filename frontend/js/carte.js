/* =====================================================
   CARTE.JS - Comportement de la page Carte
   Carte Leaflet, filtres, geolocalisation, resultats
   ===================================================== */

// =====================================================
//  DONNEES D'EXEMPLE (a remplacer par les donnees reelles
//  fournies par l'API / base PostgreSQL+PostGIS)
// =====================================================
let etablissements = [];

// Position de reference par defaut (centre d'Antananarivo)
let userPosition = { lat: -18.9100, lon: 47.5255 };
let currentRadius = 1000; // metres
let activeCategory = "all";
let minRating = 0;

// =====================================================
//  INITIALISATION DE LA CARTE LEAFLET
// =====================================================
const map = L.map('map').setView([userPosition.lat, userPosition.lon], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

const iconDefault = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

let markersLayer = L.layerGroup().addTo(map);
let userMarker = null;
let radiusCircle = null;

// =====================================================
//  FONCTIONS UTILITAIRES
// =====================================================

// Calcul de distance Haversine (en metres)
function calculerDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(metres) {
  if (metres < 1000) return Math.round(metres) + " m";
  return (metres / 1000).toFixed(1) + " km";
}

function formatPrix(prix) {
  return prix.toLocaleString('fr-FR') + " Ar";
}

// =====================================================
//  FILTRAGE ET AFFICHAGE
// =====================================================
function appliquerFiltres() {
  const prixMin = parseFloat(document.getElementById('prixMin').value) || 0;
  const prixMax = parseFloat(document.getElementById('prixMax').value) || Infinity;

  let resultats = etablissements
    .map(e => ({
      ...e,
      distance: calculerDistance(userPosition.lat, userPosition.lon, e.lat, e.lon)
    }))
    .filter(e => e.prix_moyen >= prixMin && e.prix_moyen <= prixMax)
    .filter(e => activeCategory === "all" || e.categorie === activeCategory)
    .filter(e => e.note >= minRating)
    .filter(e => e.distance <= currentRadius);

  // Tri
  const sortBy = document.getElementById('sortSelect').value;
  if (sortBy === "distance") resultats.sort((a, b) => a.distance - b.distance);
  else if (sortBy === "price_asc") resultats.sort((a, b) => a.prix_moyen - b.prix_moyen);
  else if (sortBy === "price_desc") resultats.sort((a, b) => b.prix_moyen - a.prix_moyen);
  else if (sortBy === "rating") resultats.sort((a, b) => b.note - a.note);

  afficherResultats(resultats);
  afficherMarqueurs(resultats);
}

function afficherResultats(resultats) {
  const list = document.getElementById('resultsList');
  document.getElementById('resultsCount').textContent =
    resultats.length + (resultats.length === 1 ? " établissement trouvé" : " établissements trouvés");

  if (resultats.length === 0) {
    list.innerHTML = `<div class="text-center py-5" style="color: var(--color-text-muted);">
      <i data-lucide="map-pin" style="width:2rem;height:2rem;color:var(--color-accent);margin-bottom:1rem;"></i>
      <p class="mb-0">Aucun établissement ne correspond à ces critères.</p>
      <p class="mb-0" style="font-size:0.85rem;">Essayez d'élargir le rayon ou le budget.</p>
    </div>`;
    return;
  }

  list.innerHTML = resultats.map(e => {
    let imgSrc = (e.photos && e.photos.length > 0) ? (e.photos[0].startsWith("http") ? e.photos[0] : "images/" + e.photos[0]) : "images/carlton1.jpg";
    return `
    <div class="etab-card" onclick="centrerSur(${e.lat}, ${e.lon}, ${e.id})">
      <img src="${imgSrc}" class="etab-card-img" alt="${e.nom}">
      <div class="etab-card-content">
        <div>
          <h3 class="etab-card-title">${e.nom}</h3>
          <div class="etab-card-cat">
            <i data-lucide="${e.categorie === 'hotel' ? 'bed-double' : 'utensils-crossed'}"></i>
            ${e.categorie === 'hotel' ? 'Hôtel' : 'Restaurant'} · ${formatDistance(e.distance)}
          </div>
        </div>
        <div class="etab-card-bottom">
          <span class="etab-card-price">${formatPrix(e.prix_moyen)}</span>
          <span class="etab-card-rating"><i data-lucide="star" style="width:0.8rem;height:0.8rem;fill:var(--color-star);"></i> ${e.note}</span>
        </div>
      </div>
    </div>
  `}).join('');
  
  setTimeout(() => { if (window.lucide) lucide.createIcons(); }, 10);
}

function afficherMarqueurs(resultats) {
  markersLayer.clearLayers();

  resultats.forEach(e => {
    let imgSrc = (e.photos && e.photos.length > 0) ? (e.photos[0].startsWith("http") ? e.photos[0] : "images/" + e.photos[0]) : "images/carlton1.jpg";
    const marker = L.marker([e.lat, e.lon], { icon: iconDefault }).addTo(markersLayer);
    marker.bindPopup(`
      <img src="${imgSrc}" class="popup-img" alt="${e.nom}">
      <div class="popup-info">
        <h6 class="popup-title">${e.nom}</h6>
        <div class="popup-cat">
          <i data-lucide="${e.categorie === 'hotel' ? 'bed-double' : 'utensils-crossed'}"></i> ${e.categorie === 'hotel' ? 'Hôtel' : 'Restaurant'}
          · <i data-lucide="route" class="ms-1 me-1"></i>${formatDistance(e.distance)}
        </div>
        <div class="popup-price">${formatPrix(e.prix_moyen)}</div>
        <a class="popup-btn" href="etablissement.html?id=${e.id}">
          Voir les détails
        </a>
      </div>
    `);
    marker._etabId = e.id;
  });
}

// Centrer la carte sur un etablissement depuis la liste
window.centrerSur = function(lat, lon, id) {
  map.setView([lat, lon], 16);
  markersLayer.eachLayer(m => {
    if (m._etabId === id) m.openPopup();
  });
};

map.on('popupopen', function() {
  setTimeout(() => { if (window.lucide) lucide.createIcons(); }, 10);
});

// =====================================================
//  GEOLOCALISATION "PRES DE MOI"
// =====================================================
document.getElementById('btnNearMe').addEventListener('click', function() {
  if (!navigator.geolocation) {
    alert("La géolocalisation n'est pas supportée par votre navigateur.");
    return;
  }

  navigator.geolocation.getCurrentPosition(function(position) {
    userPosition = {
      lat: position.coords.latitude,
      lon: position.coords.longitude
    };

    document.getElementById('nearMeStatus').classList.add('active');

    // Marqueur utilisateur
    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.marker([userPosition.lat, userPosition.lon], {
      icon: L.divIcon({ className: 'user-marker', iconSize: [18, 18] })
    }).addTo(map);

    // Cercle de rayon
    dessinerCercleRayon();

    map.setView([userPosition.lat, userPosition.lon], 14);
    appliquerFiltres();
  }, function(error) {
    alert("Impossible de récupérer votre position : " + error.message);
  });
});

function dessinerCercleRayon() {
  if (radiusCircle) map.removeLayer(radiusCircle);
  radiusCircle = L.circle([userPosition.lat, userPosition.lon], {
    radius: currentRadius,
    color: '#059669',
    fillColor: '#10B981',
    fillOpacity: 0.15,
    weight: 1.5
  }).addTo(map);
}

// =====================================================
//  RAYON DE RECHERCHE
// =====================================================
const radiusRange = document.getElementById('radiusRange');
radiusRange.addEventListener('input', function() {
  currentRadius = parseInt(this.value);
  const display = currentRadius >= 1000 ? (currentRadius / 1000) + " km" : currentRadius + " m";
  document.getElementById('radiusValue').textContent = display;
  if (userMarker) dessinerCercleRayon();
});

// =====================================================
//  FILTRES : CATEGORIE (CHIPS)
// =====================================================
function activerCategorie(categorie) {
  document.querySelectorAll('.chip').forEach(c => {
    c.classList.toggle('active', c.dataset.category === categorie);
  });
  activeCategory = categorie;
}

document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', function() {
    activerCategorie(this.dataset.category);
    appliquerFiltres();
  });
});

// =====================================================
//  FILTRES : NOTE (ETOILES)
// =====================================================
const stars = document.querySelectorAll('#ratingFilter .star');
stars.forEach(star => {
  star.addEventListener('click', function() {
    const value = parseInt(this.dataset.value);
    minRating = (minRating === value) ? 0 : value;
    stars.forEach(s => {
      s.classList.toggle('active', parseInt(s.dataset.value) <= minRating);
    });
    document.getElementById('ratingLabel').textContent =
      minRating === 0 ? "Toutes les notes" : minRating + " étoiles et plus";
    appliquerFiltres();
  });
});

// =====================================================
//  BOUTON APPLIQUER + TRI
// =====================================================
document.getElementById('btnApplyFilters').addEventListener('click', appliquerFiltres);
// document.getElementById('sortSelect').addEventListener('change', appliquerFiltres);

// Custom Select Logic
const customSortWrapper = document.getElementById('customSortSelect');
if (customSortWrapper) {
  const customOptions = customSortWrapper.querySelectorAll('.custom-option');
  const sortSelectHidden = document.getElementById('sortSelect');
  const triggerLabel = customSortWrapper.querySelector('.custom-select-label');

  customSortWrapper.querySelector('.custom-select-trigger').addEventListener('click', function(e) {
    e.stopPropagation();
    customSortWrapper.classList.toggle('open');
  });

  customOptions.forEach(option => {
    option.addEventListener('click', function(e) {
      e.stopPropagation();
      customOptions.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
      triggerLabel.textContent = this.textContent;
      sortSelectHidden.value = this.dataset.value;
      customSortWrapper.classList.remove('open');
      appliquerFiltres();
    });
  });

  document.addEventListener('click', function(e) {
    if (!customSortWrapper.contains(e.target)) {
      customSortWrapper.classList.remove('open');
    }
  });
}

// =====================================================
//  RECHERCHE PAR NOM (navbar)
// =====================================================
function rechercherParNom(valeur) {
  valeur = valeur.toLowerCase().trim();
  if (!valeur) { appliquerFiltres(); return; }

  let resultats = etablissements
    .map(e => ({ ...e, distance: calculerDistance(userPosition.lat, userPosition.lon, e.lat, e.lon) }))
    .filter(e => e.nom.toLowerCase().includes(valeur));

  afficherResultats(resultats);
  afficherMarqueurs(resultats);
  if (resultats.length > 0) {
    map.setView([resultats[0].lat, resultats[0].lon], 15);
  }
}

document.querySelector('.navbar-search-form').addEventListener('submit', function(e) {
  e.preventDefault();
  rechercherParNom(document.getElementById('navSearchInput').value);
});

// =====================================================
//  INITIALISATION (lecture des parametres d'URL)
//  ex: carte.html?categorie=hotel  ou  carte.html?recherche=Sakamanga
// =====================================================
function loadDataAndInit() {
  fetch('http://localhost:8080/api/etablissements')
    .then(res => res.json())
    .then(data => {
      etablissements = data;
      sessionStorage.setItem('etablissements', JSON.stringify(etablissements));
      
      const params = new URLSearchParams(window.location.search);
      if (params.has('categorie')) {
        activerCategorie(params.get('categorie'));
      }
      
      if (params.has('recherche')) {
        document.getElementById('navSearchInput').value = params.get('recherche');
        rechercherParNom(params.get('recherche'));
      } else {
        appliquerFiltres();
      }
    })
    .catch(err => console.error("API error: ", err));
}

loadDataAndInit();

// Si l'URL contient #near-me, on scrolle vers le bloc localisation (mobile)
if (window.location.hash === '#near-me') {
  document.getElementById('near-me').scrollIntoView({ behavior: 'smooth' });
}
