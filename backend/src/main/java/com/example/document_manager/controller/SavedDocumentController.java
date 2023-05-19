package com.example.document_manager.controller;

import com.example.document_manager.exception.DataExistsException;
import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.InvalidInputException;
import com.example.document_manager.model.SavedDocument;
import com.example.document_manager.model.request.CreateDocumentRequest;
import com.example.document_manager.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/saved")
@AllArgsConstructor
public class SavedDocumentController {
    private final SavedDocumentService savedDocumentService;
    private final DocumentDataService documentDataService;
    private final UserService userService;
    private final GroupService groupService;
    private final FileService fileService;

    @GetMapping("/all/{ownerId}")
    public ResponseEntity<List<SavedDocument>> getAllByOwner(@PathVariable String ownerId) {
        List<SavedDocument> savedDocumentList = savedDocumentService.getAllByOwner(ownerId);
        return new ResponseEntity<>(savedDocumentList, HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<SavedDocument> getById(@PathVariable String id) {
        SavedDocument savedDocument = savedDocumentService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("SavedDocument", id));
        return new ResponseEntity<>(savedDocument, HttpStatus.OK);
    }

    @PostMapping(value = "/add/user/{username}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SavedDocument> addToUserLibrary(
            @PathVariable String username,
            @RequestPart("file") MultipartFile file,
            @RequestParam("data") String requestBody
            ) {
        userService.getByUsername(username)
                .orElseThrow(() -> new DataNotFoundException("User", username));

        CreateDocumentRequest data;
        try {
            data = new ObjectMapper().readValue(requestBody, CreateDocumentRequest.class);
        } catch (Exception e) {
            throw new InvalidInputException("Invalid JSON format!");
        }

        if (data.title() == null || data.title().isBlank()) {
            throw new InvalidInputException(true, "title");
        }

        if (data.authorList() != null && !data.authorList().isEmpty()) {
            boolean invalidAuthor = data.authorList().stream().anyMatch(author -> author == null || author.isBlank());
            if (invalidAuthor) {
                throw new InvalidInputException(false, "author");
            }
        }

        if (data.description() != null && data.description().isBlank()) {
            throw new InvalidInputException(false, "description");
        }

        String fileHash = fileService.calculateSHA256(file)
                .orElseThrow(() -> new RuntimeException("Failed to calculate file hash!"));

        Optional<String> documentId = fileService.exists(fileHash);
        if (documentId.isPresent()) {
            SavedDocument savedDocument = savedDocumentService.save(username, documentId.get())
                    .orElseThrow(() -> new DataExistsException(String.format("Document with ID \"%s\" is already saved!", documentId.get())));
            return new ResponseEntity<>(savedDocument, HttpStatus.CREATED);
        }


        String fileId = fileService.save(file)
                .orElseThrow(() -> new RuntimeException("Failed to save file!"));

        SavedDocument savedDocument = savedDocumentService.add(username, data, fileId, fileHash)
                .orElseThrow(() -> new RuntimeException("Failed to create document!"));
        return new ResponseEntity<>(savedDocument, HttpStatus.CREATED);
    }

    @PostMapping("/save/user/{username}")
    public ResponseEntity<SavedDocument> saveToUserLibrary(@PathVariable String username, @RequestParam("documentId") String documentId) {
        userService.getByUsername(username)
                .orElseThrow(() -> new DataNotFoundException("User", username));

        if (documentId == null || documentId.isBlank()) {
            throw new InvalidInputException(true, "documentId");
        }
        documentDataService.getById(documentId)
                .orElseThrow(() -> new DataNotFoundException("DocumentData", documentId));

        SavedDocument savedDocument = savedDocumentService.save(username, documentId)
                .orElseThrow(() -> new DataExistsException(String.format("Document with ID \"%s\" is already saved!", documentId)));
        return new ResponseEntity<>(savedDocument, HttpStatus.CREATED);
    }

    @PostMapping("/save/group/{groupId}")
    public ResponseEntity<SavedDocument> saveToGroupLibrary(@PathVariable String groupId, @RequestParam("documentId") String documentId) {
        groupService.getById(groupId)
                .orElseThrow(() -> new DataNotFoundException("Group", groupId));

        if (documentId == null || documentId.isBlank()) {
            throw new InvalidInputException(true, "documentId");
        }
        documentDataService.getById(documentId)
                .orElseThrow(() -> new DataNotFoundException("DocumentData", documentId));

        SavedDocument savedDocument = savedDocumentService.save(groupId, documentId)
                .orElseThrow(() -> new DataExistsException(String.format("Document with ID \"%s\" is already saved!", documentId)));
        return new ResponseEntity<>(savedDocument, HttpStatus.CREATED);
    }

    //TODO: add tag

    // TODO: remove tag

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteSavedDocument(@PathVariable String id) {
        savedDocumentService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
