package com.example.document_manager.controller;

import com.example.document_manager.exception.DataExistsException;
import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.InvalidInputException;
import com.example.document_manager.exception.UnauthorizedException;
import com.example.document_manager.model.Tag;
import com.example.document_manager.model.SavedDocument;
import com.example.document_manager.model.User;
import com.example.document_manager.model.request.MetadataRequest;
import com.example.document_manager.model.request.DocumentTagRequest;
import com.example.document_manager.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("api/v1/saved")
@RequiredArgsConstructor
public class SavedDocumentController {
    private final SavedDocumentService savedDocumentService;
    private final DocumentDataService documentDataService;
    private final GroupService groupService;
    private final FileService fileService;
    private final TagService tagService;

    @GetMapping("/all")
    public ResponseEntity<List<SavedDocument>> getAllByOwner(@RequestParam(required = false) String groupId) {
        String ownerId = groupService.resolveOwnerId(groupId);
        List<SavedDocument> savedDocumentList = savedDocumentService.getAllByOwner(ownerId);
        return new ResponseEntity<>(savedDocumentList, HttpStatus.OK);
    }

    @GetMapping("/admin/all/{ownerId}")
    public ResponseEntity<List<SavedDocument>> adminGetAllByOwner(@PathVariable String ownerId) {
        List<SavedDocument> savedDocumentList = savedDocumentService.getAllByOwner(ownerId);
        return new ResponseEntity<>(savedDocumentList, HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<SavedDocument> getById(@PathVariable String id) {
        SavedDocument savedDocument = savedDocumentService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("SavedDocument", id));
        return new ResponseEntity<>(savedDocument, HttpStatus.OK);
    }

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SavedDocument> add(
            @RequestParam(required = false) String groupId,
            @RequestPart MultipartFile file,
            @RequestPart() MetadataRequest metadata
    ) {
        if (file.isEmpty()) {
            throw new InvalidInputException(true, "file");
        }
        metadata.validate();
        String ownerId = groupService.resolveOwnerId(groupId);
        byte[] fileHash = fileService.calculateSHA256(file)
                .orElseThrow(() -> new RuntimeException("Failed to calculate file hash!"));
        SavedDocument savedDocument;
        Optional<String> documentId = fileService.exists(fileHash);
        if (documentId.isPresent()) {
            savedDocument = savedDocumentService.save(ownerId, documentId.get())
                    .orElseThrow(() -> new DataExistsException(String.format("Document with ID \"%s\" is already saved!", documentId.get())));
            return new ResponseEntity<>(savedDocument, HttpStatus.CREATED);
        }
        String fileId = fileService.save(file)
                .orElseThrow(() -> new RuntimeException("Failed to save file!"));
        savedDocument = savedDocumentService.add(ownerId, metadata, fileId, fileHash)
                .orElseThrow(() -> new RuntimeException("Failed to create document!"));
        return new ResponseEntity<>(savedDocument, HttpStatus.CREATED);
    }

    @PostMapping("/save/{documentId}")
    public ResponseEntity<SavedDocument> save(@PathVariable String documentId, @RequestParam(required = false) String groupId) {
        String ownerId = groupService.resolveOwnerId(groupId);
        if (documentDataService.doesNotExist(documentId)) {
            throw new DataNotFoundException("Document", documentId);
        }
        SavedDocument savedDocument = savedDocumentService.save(ownerId, documentId)
                .orElseThrow(() -> new DataExistsException(String.format("Document with ID \"%s\" is already saved!", documentId)));
        return new ResponseEntity<>(savedDocument, HttpStatus.CREATED);
    }

    @PutMapping("/tag/add/{id}")
    public ResponseEntity<Void> addTag(@PathVariable String id, @RequestBody DocumentTagRequest request) {
        SavedDocument savedDocument = validateTagRequest(id, request);
        Tag tag = tagService.getById(request.tagId())
                .orElseThrow(() -> new DataNotFoundException("DocumentTag", request.tagId()));
        if (!Objects.equals(savedDocument.getOwnerId(), tag.getOwnerId())) {
            throw new UnauthorizedException("Owner mismatch!");
        }
        savedDocumentService.addTag(savedDocument, tag)
                .orElseThrow(() -> new DataExistsException("Failed to add tag to the save!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/tag/remove/{id}")
    public ResponseEntity<Void> removeTag(@PathVariable String id, @RequestBody DocumentTagRequest request) {
        SavedDocument savedDocument = validateTagRequest(id, request);
        savedDocumentService.removeTag(savedDocument, request.tagId());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    private SavedDocument validateTagRequest(String saveId, DocumentTagRequest request) {
        request.validate();
        SavedDocument savedDocument = savedDocumentService.getById(saveId)
                .orElseThrow(() -> new DataNotFoundException("SavedDocument", saveId));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (isUnauthorizedAccess(savedDocument, user.getUsername())) {
            throw new UnauthorizedException("User is unauthorized to update this save!");
        }
        return savedDocument;
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        SavedDocument savedDocument = savedDocumentService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("SavedDocument", id));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (isUnauthorizedAccess(savedDocument, user.getUsername())) {
            throw new UnauthorizedException("User is unauthorized to delete this save!");
        }
        savedDocumentService.delete(savedDocument);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<Void> adminDelete(@PathVariable String id) {
        SavedDocument savedDocument = savedDocumentService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("SavedDocument", id));
        savedDocumentService.delete(savedDocument);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    private boolean isUnauthorizedAccess(SavedDocument savedDocument, String username) {
        boolean validUser = Objects.equals(savedDocument.getOwnerId(), username);
        boolean validGroup = groupService.containsUser(savedDocument.getOwnerId(), username);
        return !(validUser || validGroup);
    }
}
