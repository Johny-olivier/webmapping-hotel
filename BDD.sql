-- =================================================================
-- 1. Activation de l'extension PostGIS
-- =================================================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- =================================================================
-- 2. Création des Tables
-- =================================================================

-- Table des catégories (Hôtel, Restaurant, etc.)
CREATE TABLE categorie (
    id_categorie SERIAL PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE
);

-- Table des quartiers d'Antananarivo (avec géométrie pour les stats)
CREATE TABLE quartier (
    id_quartier SERIAL PRIMARY KEY,
    nom_quartier VARCHAR(100) NOT NULL,
    arrondissement VARCHAR(50),
    geom GEOMETRY(Polygon, 4326) -- SRID 4326 pour les coordonnées WGS84
);

-- Table principale des établissements (Hôtels et Restaurants)
CREATE TABLE etablissement (
    id_etablissement SERIAL PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    adresse TEXT,
    telephone VARCHAR(20),
    prix_moyen DECIMAL(10, 2), -- En Ariary par exemple
    note DECIMAL(3, 2) DEFAULT 0.0, -- Note sur 5
    photo VARCHAR(255), -- Chemin ou URL de l'image
    id_categorie INT NOT NULL,
    id_quartier INT,
    geom GEOMETRY(Point, 4326), -- Point GPS (Longitude, Latitude)
    
    -- Contraintes de clés étrangères
    CONSTRAINT fk_categorie FOREIGN KEY (id_categorie) REFERENCES categorie(id_categorie) ON DELETE CASCADE,
    CONSTRAINT fk_quartier FOREIGN KEY (id_quartier) REFERENCES quartier(id_quartier) ON DELETE SET NULL
);

-- Table des utilisateurs (pour la gestion/admin de la V2)
CREATE TABLE utilisateur (
    id_utilisateur SERIAL PRIMARY KEY,
    nom_utilisateur VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL, -- À stocker hashé côté Backend !
    role VARCHAR(20) DEFAULT 'user' -- admin, user
);

-- =================================================================
-- 3. Création des Index Spatiaux (Essentiel pour Leaflet et les perfs)
-- =================================================================
CREATE INDEX idx_etablissement_geom ON etablissement USING gist(geom);
CREATE INDEX idx_quartier_geom ON quartier USING gist(geom);