package com.example.document_manager.controller;

import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.model.DocumentData;
import com.example.document_manager.service.DocumentDataService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/documents")
@AllArgsConstructor
public class DocumentDataController {
    private final DocumentDataService documentDataService;

    @GetMapping("/all")
    public ResponseEntity<List<DocumentData>> getAll() {
        List<DocumentData> documentDataList = documentDataService.getAll();
        return new ResponseEntity<>(documentDataList, HttpStatus.OK);
    }

    @GetMapping("/all/owner/{ownerId}")
    public ResponseEntity<List<DocumentData>> getAllByOwner(@PathVariable String ownerId) {
        List<DocumentData> documentDataList = documentDataService.getAllByOwner(ownerId);
        return new ResponseEntity<>(documentDataList, HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<DocumentData> getById(@PathVariable String id) {
        DocumentData documentData = documentDataService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("DocumentData", id));
        return new ResponseEntity<>(documentData, HttpStatus.OK);
    }

    // TODO: update metadata

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteDocumentData(@PathVariable String id) {
        documentDataService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
