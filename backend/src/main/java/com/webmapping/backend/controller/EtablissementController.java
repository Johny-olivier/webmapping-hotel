package com.webmapping.backend.controller;

import com.webmapping.backend.dto.EtablissementDto;
import com.webmapping.backend.service.EtablissementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/etablissements")
@CrossOrigin(origins = "*") // Allows calls from frontend
public class EtablissementController {

    @Autowired
    private EtablissementService etablissementService;

    @GetMapping
    public List<EtablissementDto> getAll() {
        return etablissementService.getAllEtablissements();
    }

    @GetMapping("/{id}")
    public EtablissementDto getById(@PathVariable Long id) {
        return etablissementService.getEtablissementById(id);
    }
}
