SELECT q.nom_quartier, COUNT(e.id_etablissement) AS nombre_etablissements
FROM quartier q
LEFT JOIN etablissement e ON ST_Contains(q.geom, e.geom)
GROUP BY q.nom_quartier;