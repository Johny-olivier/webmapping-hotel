package com.webmapping.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categorie")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Categorie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categorie")
    private Long idCategorie;

    @Column(nullable = false, unique = true, length = 50)
    private String libelle;
}
