package com.example.document_manager.controller;

import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.InvalidInputException;
import com.example.document_manager.model.DocumentMetadata;
import com.example.document_manager.service.DocumentMetadataService;
import com.example.document_manager.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/metadata")
@AllArgsConstructor
public class DocumentMetadataController {
    private final DocumentMetadataService metadataService;
    private final UserService userService;

    @GetMapping("/all/{documentId}")
    public ResponseEntity<?> getAllByDocumentId(@PathVariable String documentId) {
        List<DocumentMetadata> metadataList = metadataService.getAllByDocumentId(documentId);
        return new ResponseEntity<>(metadataList, HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        DocumentMetadata metadata = metadataService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("DocumentMetadata", id));
        return new ResponseEntity<>(metadata, HttpStatus.OK);
    }

    @PostMapping("/add/{documentId}")
    public ResponseEntity<?> addMetadata(@PathVariable String documentId, @RequestBody DocumentMetadata requestBody) {
        // TODO: validate documentId

        String username = requestBody.getUsername();
        String title = requestBody.getTitle();
        if (username == null || username.isBlank() || title == null || title.isBlank()) {
            throw new InvalidInputException(true, "username", "title");
        }

        userService.getByUsername(username)
                .orElseThrow(() -> new DataNotFoundException("User", username));

        DocumentMetadata metadata = new DocumentMetadata(
                username,
                documentId,
                title,
                requestBody.getAuthorList(),
                requestBody.getDescription(),
                requestBody.getPublicationDate(),
                requestBody.getIdentifierList(),
                requestBody.getOtherData()
        );
        DocumentMetadata addedMetadata = metadataService.addMetadata(metadata)
                .orElseThrow(() -> new RuntimeException("Failed to create document metadata!"));
        return new ResponseEntity<>(addedMetadata, HttpStatus.CREATED);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteMetadata(@PathVariable String id) {
        metadataService.deleteMetadata(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
