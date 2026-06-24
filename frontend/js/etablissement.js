/* =====================================================
   ETABLISSEMENT.JS - Comportement de la fiche detaillee
   Lit l'id depuis l'URL, recupere les donnees, affiche
   la fiche complete + mini-carte Leaflet
   ===================================================== */

function formatPrix(prix) {
  return prix.toLocaleString('fr-FR') + " Ar";
}

function genererEtoiles(note) {
  const pleines = Math.round(note);
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<i data-lucide="star" style="width:0.95rem;height:0.95rem;${i <= pleines ? 'fill:var(--color-star);color:var(--color-star);' : 'color:var(--color-border);'}"></i> `;
  }
  return html;
}

// =====================================================
//  RECUPERATION DE L'ETABLISSEMENT DEPUIS L'URL ET API
// =====================================================
const params = new URLSearchParams(window.location.search);
const etabId = parseInt(params.get('id'));

const content = document.getElementById('etabContent');

function renderEtablissement(etablissement) {
  if (!etablissement) {
    content.innerHTML = `
      <div class="etab-not-found">
        <i data-lucide="map-pin" style="width:4rem;height:4rem;margin-bottom:1.5rem;opacity:0.5;"></i>
        <h2>Établissement introuvable</h2>
        <p>Cet établissement n'existe pas ou a été retiré.</p>
        <a href="carte.html" class="btn-tana-primary mt-3">
          <i data-lucide="map"></i>Retour à la carte
        </a>
      </div>
    `;
  } else {
    document.title = etablissement.nom + " — Tana Explorer";

    content.innerHTML = `
      
      <div class="etab-gallery">
        <span class="etab-gallery-badge">
          <i data-lucide="${etablissement.categorie === 'hotel' ? 'bed-double' : 'utensils-crossed'}"></i>
          ${etablissement.categorie === 'hotel' ? 'Hôtel' : 'Restaurant'}
        </span>
        ${etablissement.photos && etablissement.photos.length >= 3 ? 
          `<div class="gallery-img-wrapper main-wrapper">
             <img src="${etablissement.photos[0].startsWith("http") ? etablissement.photos[0] : "images/" + etablissement.photos[0]}" alt="${etablissement.nom}" class="etab-gallery-main">
           </div>
           <div class="gallery-img-wrapper sub-wrapper">
             <img src="${etablissement.photos[1].startsWith("http") ? etablissement.photos[1] : "images/" + etablissement.photos[1]}" alt="${etablissement.nom}" class="etab-gallery-sub">
           </div>
           <div class="gallery-img-wrapper sub-wrapper">
             <img src="${etablissement.photos[2].startsWith("http") ? etablissement.photos[2] : "images/" + etablissement.photos[2]}" alt="${etablissement.nom}" class="etab-gallery-sub">
           </div>` :
          `<div class="gallery-img-wrapper single-wrapper">
             <img src="${etablissement.photos && etablissement.photos.length > 0 ? (etablissement.photos[0].startsWith("http") ? etablissement.photos[0] : "images/" + etablissement.photos[0]) : ''}" alt="${etablissement.nom}" class="etab-gallery-single">
           </div>`
        }
      </div>


      <div class="etab-header">
        <div>
          <h1 class="etab-title">${etablissement.nom}</h1>
          <div class="etab-address"><i data-lucide="map-pin" class="me-2" style="width:1.1rem;height:1.1rem;"></i>${etablissement.adresse}</div>
        </div>
        <div class="etab-rating-block">
          <div class="etab-rating-value">${etablissement.note}</div>
          <div class="etab-rating-stars">${genererEtoiles(etablissement.note)}</div>
          <div class="etab-rating-label">Note moyenne</div>
        </div>
      </div>

      <div class="etab-grid">
        <!-- Colonne principale -->
        <div>
          <div class="etab-section">
            <h2><i data-lucide="info"></i>Description</h2>
            <p>${etablissement.description}</p>
          </div>

          <div class="etab-section">
            <h2><i data-lucide="map"></i>Localisation</h2>
            <div id="etabMiniMap"></div>
          </div>
        </div>

        <!-- Colonne info pratique -->
        <div class="etab-sidebar">
          <div class="info-card">
            <div class="info-row">
              <i data-lucide="phone"></i>
              <div>
                <div class="info-row-label">Téléphone</div>
                <div class="info-row-value">${etablissement.telephone}</div>
              </div>
            </div>
            <div class="info-row">
              <i data-lucide="tag"></i>
              <div>
                <div class="info-row-label">Prix moyen</div>
                <div class="info-row-value price">${formatPrix(etablissement.prix_moyen)}</div>
              </div>
            </div>
            <div class="info-row">
              <i data-lucide="map-pin"></i>
              <div>
                <div class="info-row-label">Adresse</div>
                <div class="info-row-value">${etablissement.adresse}</div>
              </div>
            </div>
          </div>

          <div class="info-card">
            <button class="btn-itinerary-full" id="btnItineraire">
              <i data-lucide="navigation"></i>Calculer l'itinéraire
            </button>
            <a class="btn-call-full" href="tel:${etablissement.telephone.replace(/\s/g, '')}">
              <i data-lucide="phone"></i>Appeler
            </a>
          </div>
        </div>
      </div>
    `;

    // ===== MINI CARTE LEAFLET =====
    const miniMap = L.map('etabMiniMap', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([etablissement.lat, etablissement.lon], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(miniMap);

    L.marker([etablissement.lat, etablissement.lon]).addTo(miniMap)
      .bindPopup(etablissement.nom)
      .openPopup();

    // ===== BOUTON ITINERAIRE =====
    document.getElementById('btnItineraire').addEventListener('click', function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const url = `https://www.openstreetmap.org/directions?from=${lat}%2C${lon}&to=${etablissement.lat}%2C${etablissement.lon}`;
          window.open(url, '_blank');
        }, function() {
          const url = `https://www.openstreetmap.org/directions?to=${etablissement.lat}%2C${etablissement.lon}`;
          window.open(url, '_blank');
        });
      } else {
        const url = `https://www.openstreetmap.org/directions?to=${etablissement.lat}%2C${etablissement.lon}`;
        window.open(url, '_blank');
      }
    });

    setTimeout(() => { if (window.lucide) lucide.createIcons(); }, 10);
  }
}

if(etabId) {
    fetch('http://localhost:8080/api/etablissements/' + etabId)
        .then(res => {
            if(!res.ok) throw new Error("Not found");
            return res.json();
        })
        .then(data => renderEtablissement(data))
        .catch(err => renderEtablissement(null));
} else {
    renderEtablissement(null);
}

// =====================================================
//  RECHERCHE PAR NOM (navbar) -> redirige vers la carte
// =====================================================
document.querySelector('.navbar-search-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const valeur = this.querySelector('.search-name-input').value.trim();
  window.location.href = valeur
    ? 'carte.html?recherche=' + encodeURIComponent(valeur)
    : 'carte.html';
});
