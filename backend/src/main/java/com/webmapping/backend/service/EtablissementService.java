package com.webmapping.backend.service;

import com.webmapping.backend.dto.EtablissementDto;
import com.webmapping.backend.model.Etablissement;
import com.webmapping.backend.repository.EtablissementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EtablissementService {

    @Autowired
    private EtablissementRepository etablissementRepository;

    public List<EtablissementDto> getAllEtablissements() {
        return etablissementRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public EtablissementDto getEtablissementById(Long id) {
        return etablissementRepository.findById(id).map(this::convertToDto).orElse(null);
    }

    private EtablissementDto convertToDto(Etablissement e) {
        EtablissementDto dto = new EtablissementDto();
        dto.setId(e.getIdEtablissement());
        dto.setNom(e.getNom());
        dto.setCategorie(e.getCategorie() != null ? e.getCategorie().getLibelle().toLowerCase() : "inconnu");
        dto.setAdresse(e.getAdresse());
        dto.setTelephone(e.getTelephone());
        dto.setPrix_moyen(e.getPrixMoyen() != null ? e.getPrixMoyen().doubleValue() : 0.0);
        dto.setNote(e.getNote() != null ? e.getNote().doubleValue() : 0.0);
        dto.setDescription(e.getDescription());
        dto.setPhotos(e.getPhotos());
        if (e.getGeom() != null) {
            dto.setLat(e.getGeom().getY());
            dto.setLon(e.getGeom().getX());
        }
        return dto;
    }
}
