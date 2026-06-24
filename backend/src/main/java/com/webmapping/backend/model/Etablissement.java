package com.webmapping.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;
import java.math.BigDecimal;

@Entity
@Table(name = "etablissement")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Etablissement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_etablissement")
    private Long idEtablissement;

    @Column(nullable = false, length = 150)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String adresse;

    @Column(length = 20)
    private String telephone;

    @Column(name = "prix_moyen")
    private BigDecimal prixMoyen;

    @Column(precision = 3, scale = 2)
    private BigDecimal note;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "etablissement_photos", joinColumns = @JoinColumn(name = "id_etablissement"))
    @Column(name = "photo_url")
    private java.util.List<String> photos;

    @Column(columnDefinition = "TEXT")
    private String description; // Adding description as requested in frontend

    @ManyToOne
    @JoinColumn(name = "id_categorie", nullable = false)
    private Categorie categorie;

    @ManyToOne
    @JoinColumn(name = "id_quartier")
    private Quartier quartier;

    @Column(columnDefinition = "geometry(Point,4326)")
    private Point geom;
}
