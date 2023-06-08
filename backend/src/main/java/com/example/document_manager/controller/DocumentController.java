package com.example.document_manager.controller;

import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.UnauthorizedException;
import com.example.document_manager.model.DocumentData;
import com.example.document_manager.model.Metadata;
import com.example.document_manager.model.DocumentTag;
import com.example.document_manager.model.User;
import com.example.document_manager.model.request.DocumentDuplicateRequest;
import com.example.document_manager.model.request.MetadataRequest;
import com.example.document_manager.model.request.RelatedDocumentRequest;
import com.example.document_manager.model.request.TagAddRequest;
import com.example.document_manager.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DeletedDocumentService deletedDocumentService;
    private final SavedDocumentService savedDocumentService;
    private final DocumentDataService documentDataService;
    private final MetadataService metadataService;
    private final DocumentTagService documentTagService;
    private final CommentService commentService;
    private final FileService fileService;

    @GetMapping("/all")
    public ResponseEntity<List<DocumentData>> getAll() {
        List<DocumentData> documentDataList = documentDataService.getAll();
        return new ResponseEntity<>(documentDataList, HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<DocumentData> getById(@PathVariable String id) {
        DocumentData documentData = documentDataService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Document", id));
        return new ResponseEntity<>(documentData, HttpStatus.OK);
    }

    @GetMapping("/metadata/all/{id}")
    public ResponseEntity<?> getAllMetadataByDocumentId(@PathVariable String id) {
        List<Metadata> metadataList = metadataService.getAllByDocumentId(id);
        return new ResponseEntity<>(metadataList, HttpStatus.OK);
    }

    @GetMapping("/metadata/get/{metadataId}")
    public ResponseEntity<?> getMetadataById(@PathVariable String metadataId) {
        Metadata metadata = metadataService.getById(metadataId)
                .orElseThrow(() -> new DataNotFoundException("Metadata", metadataId));
        return new ResponseEntity<>(metadata, HttpStatus.OK);
    }

    @PostMapping("/update/{id}")
    public ResponseEntity<Void> updateMetadata(@PathVariable String id, @RequestBody MetadataRequest request) {
        request.validate();
        DocumentData documentData = documentDataService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Document", id));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        metadataService.add(documentData, request, user.getUsername())
                .orElseThrow(() -> new RuntimeException("Failed to update document metadata!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/tag/add/{id}")
    public ResponseEntity<Void> addTag(@PathVariable String id, @RequestBody TagAddRequest request) {
        request.validate();
        DocumentData documentData = documentDataService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Document", id));
        DocumentTag documentTag = documentTagService.getById(request.tagId())
                .orElseThrow(() -> new DataNotFoundException("DocumentTag", request.tagId()));
        if (documentTag.getOwnerId() != null) {
            throw new UnauthorizedException("Provided tag is not public!");
        }
        documentDataService.addTag(documentData, documentTag)
                .orElseThrow(() -> new RuntimeException("Failed to add tag!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/tag/remove/{id}")
    public ResponseEntity<Void> removeTag(@PathVariable String id, @RequestBody TagAddRequest request) {
        request.validate();
        DocumentData documentData = documentDataService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Document", id));
        documentDataService.removeTag(documentData, request.tagId());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/related/add")
    public ResponseEntity<Void> addRelatedDocument(@RequestBody RelatedDocumentRequest request) {
        request.validate();
        DocumentData documentData = documentDataService.getById(request.documentId())
                .orElseThrow(() -> new DataNotFoundException("Document", request.documentId()));
        documentDataService.getById(request.relatedDocumentId())
                .orElseThrow(() -> new DataNotFoundException("Document", request.relatedDocumentId()));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        metadataService.addRelatedDocument(documentData, request.relatedDocumentId(), user.getUsername())
                .orElseThrow(() -> new RuntimeException("Failed to add related document!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/related/remove")
    public ResponseEntity<Void> removeRelatedDocument(@RequestBody RelatedDocumentRequest request) {
        request.validate();
        DocumentData documentData = documentDataService.getById(request.documentId())
                .orElseThrow(() -> new DataNotFoundException("Document", request.documentId()));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        metadataService.removeRelatedDocument(documentData, request.relatedDocumentId(), user.getUsername());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/admin/duplicate")
    public ResponseEntity<Void> deleteDuplicate(@RequestBody DocumentDuplicateRequest request) {
        request.validate();
        documentDataService.getById(request.originalId())
                .orElseThrow(() -> new DataNotFoundException("Document", request.originalId()));
        DocumentData duplicateData = documentDataService.getById(request.duplicateId())
                .orElseThrow(() -> new DataNotFoundException("Document", request.duplicateId()));

        if (request.migrateComments()) {
            commentService.migrate(request.duplicateId(), request.originalId());
        }
        else {
            commentService.deleteAllByDocumentId(request.duplicateId());
        }
        savedDocumentService.migrate(request.duplicateId(), request.originalId());
        deletedDocumentService.deleteByDocumentId(request.duplicateId());
        metadataService.deleteAllByDocumentId(request.duplicateId());
        fileService.delete(duplicateData.getFileId());
        documentDataService.delete(request.duplicateId());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
