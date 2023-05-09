package com.example.document_manager.controller;

import com.example.document_manager.model.DocumentMetadata;
import com.example.document_manager.model.User;
import com.example.document_manager.service.DocumentMetadataService;
import com.example.document_manager.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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
        Optional<DocumentMetadata> metadata = metadataService.getById(id);
        if (metadata.isPresent()) {
            return new ResponseEntity<>(metadata, HttpStatus.OK);
        }
        return new ResponseEntity<>(String.format("Metadata with id \"%s\" does not exist!", id), HttpStatus.NOT_FOUND);
    }

    @PostMapping("/add/{documentId}")
    public ResponseEntity<?> addMetadata(@PathVariable String documentId, @RequestBody DocumentMetadata requestBody) {
        // TODO: validate documentId

        String username = requestBody.getUsername();
        String title = requestBody.getTitle();
        if (username == null || username.isBlank() || title == null || title.isBlank()) {
            return new ResponseEntity<>("Invalid input: \"username\" and \"title\" fields are required!", HttpStatus.BAD_REQUEST);
        }

        Optional<User> user = userService.getByUsername(username);
        if (user.isEmpty()) {
            return new ResponseEntity<>(String.format("User with username \"%s\" does not exist!", username), HttpStatus.NOT_FOUND);
        }

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
        Optional<DocumentMetadata> addedMetadata = metadataService.addMetadata(metadata);
        if (addedMetadata.isPresent()) {
            return new ResponseEntity<>(addedMetadata, HttpStatus.CREATED);
        }
        return new ResponseEntity<>("Failed to create document metadata!", HttpStatus.CONFLICT);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteMetadata(@PathVariable String id) {
        metadataService.deleteMetadata(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
