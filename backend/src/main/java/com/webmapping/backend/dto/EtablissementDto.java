package com.webmapping.backend.dto;

import lombok.Data;

@Data
public class EtablissementDto {
    private Long id;
    private String nom;
    private String categorie;
    private String adresse;
    private String telephone;
    private Double prix_moyen;
    private Double note;
    private String description;
    private java.util.List<String> photos;
    private Double lat;
    private Double lon;
}
