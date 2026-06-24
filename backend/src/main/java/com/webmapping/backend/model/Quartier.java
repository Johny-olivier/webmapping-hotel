package com.webmapping.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Polygon;

@Entity
@Table(name = "quartier")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quartier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_quartier")
    private Long idQuartier;

    @Column(name = "nom_quartier", nullable = false, length = 100)
    private String nomQuartier;

    @Column(length = 50)
    private String arrondissement;

    @Column(columnDefinition = "geometry(Polygon,4326)")
    private Polygon geom;
}
