SELECT nom, adresse, ST_Distance(geom, ST_SetSRID(ST_MakePoint(47.52, -18.91), 4326)) AS distance
FROM etablissement
ORDER BY geom <-> ST_SetSRID(ST_MakePoint(47.52, -18.91), 4326)
LIMIT 1;