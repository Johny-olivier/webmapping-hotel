/* =====================================================
   NAVBAR.JS - Comportement commun de la barre de navigation
   Utilise sur toutes les pages (Accueil, Carte, Etablissement)
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  // ----- Marquer le lien actif selon la page courante -----
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-tana .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });

  // ----- Recherche par nom depuis la navbar -----
  // carte.js et etablissement.js gerent deja leur propre soumission
  // de ce formulaire (recherche locale ou redirection). On ne branche
  // ce comportement par defaut QUE sur les pages qui n'ont pas de
  // gestionnaire dedie, pour eviter un double submit.
  const pagesAvecGestionPropre = ['carte.html', 'etablissement.html'];
  const searchForm = document.querySelector('.navbar-search-form');
  if (searchForm && !pagesAvecGestionPropre.includes(currentPage)) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const valeur = searchForm.querySelector('.search-name-input').value.trim();
      const url = valeur
        ? 'carte.html?recherche=' + encodeURIComponent(valeur)
        : 'carte.html';
      window.location.href = url;
    });
  }

  // ----- Afficher/Masquer la barre de recherche au scroll (Accueil) -----
  const navbar = document.getElementById('mainNav');
  if (navbar && navbar.classList.contains('navbar-home')) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 350) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // ----- Recherche depuis le Hero Banner (Accueil) -----
  const heroSearch = document.getElementById('heroSearchForm');
  if (heroSearch) {
    heroSearch.addEventListener('submit', function (e) {
      e.preventDefault();
      const valeur = document.getElementById('heroSearchInput').value.trim();
      window.location.href = valeur 
        ? 'carte.html?recherche=' + encodeURIComponent(valeur)
        : 'carte.html';
    });
  }
});
