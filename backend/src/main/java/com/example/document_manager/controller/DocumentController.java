package com.example.document_manager.controller;

import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.UnauthorizedException;
import com.example.document_manager.model.*;
import com.example.document_manager.model.request.DocumentDuplicateRequest;
import com.example.document_manager.model.request.MetadataRequest;
import com.example.document_manager.model.request.RelatedDocumentRequest;
import com.example.document_manager.model.request.DocumentTagRequest;
import com.example.document_manager.model.response.DocumentResponse;
import com.example.document_manager.model.response.DocumentTagCollection;
import com.example.document_manager.model.response.GroupTagCollection;
import com.example.document_manager.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DeletedDocumentService deletedDocumentService;
    private final SavedDocumentService savedDocumentService;
    private final DocumentDataService documentDataService;
    private final TagService tagService;
    private final MetadataService metadataService;
    private final CommentService commentService;
    private final GroupService groupService;
    private final FileService fileService;

    @GetMapping("/all")
    public ResponseEntity<List<DocumentResponse>> getAll() {
        List<DocumentData> documentDataList = documentDataService.getAll();
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<String> groupIdList = groupService.getGroupIdsByUsername(user.getUsername());

        List<SavedDocument> privateSavedDocumentList = savedDocumentService.getAllByOwner(user.getUsername());
        List<SavedDocument> groupSavedDocumentList = savedDocumentService.getAllByOwnerIdList(groupIdList);

        List<DocumentResponse> response = documentDataList.stream()
                .map(document -> {
                    DocumentTagCollection documentTagCollection = new DocumentTagCollection(
                            document.getTagList(),
                            getPrivateTagSet(document.getId(), privateSavedDocumentList),
                            getGroupTagCollectionList(document.getId(), groupSavedDocumentList)
                    );
                    return new DocumentResponse(
                            document.getId(),
                            document.getFileId(),
                            document.getMetadata(),
                            documentTagCollection
                    );
                })
                .collect(Collectors.toList());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<DocumentResponse> getById(@PathVariable String id) {
        DocumentData documentData = documentDataService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Document", id));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<String> groupIdList = groupService.getGroupIdsByUsername(user.getUsername());
        DocumentTagCollection documentTagCollection = new DocumentTagCollection(
                documentData.getTagList(),
                getPrivateTagSet(documentData.getId(), user.getUsername()),
                getGroupTagCollectionList(groupIdList, documentData.getId())
        );
        DocumentResponse response = new DocumentResponse(
                documentData.getId(),
                documentData.getFileId(),
                documentData.getMetadata(),
                documentTagCollection
        );
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    private Set<Tag> getPrivateTagSet(String documentId, List<SavedDocument> savedDocumentList) {
        return savedDocumentList.stream()
                .filter(document -> Objects.equals(document.getDocumentId(), documentId))
                .findFirst()
                .map(SavedDocument::getTagList)
                .orElse(new HashSet<>());
    }

    private Set<Tag> getPrivateTagSet(String documentId, String username) {
        return savedDocumentService.getByOwnerIdAndDocumentId(username, documentId)
                .map(SavedDocument::getTagList)
                .orElse(new HashSet<>());
    }

    private List<GroupTagCollection> getGroupTagCollectionList(String documentId, List<SavedDocument> savedDocumentList) {
        return savedDocumentList.stream()
                .filter(document -> Objects.equals(document.getDocumentId(), documentId))
                .map(document -> new GroupTagCollection(document.getOwnerId(), document.getTagList()))
                .collect(Collectors.toList());
    }

    private List<GroupTagCollection> getGroupTagCollectionList(List<String> groupIdList, String documentId) {
        return savedDocumentService.getAllByDocumentIdAndOwnerIdList(documentId, groupIdList)
                .stream()
                .map(document -> new GroupTagCollection(document.getOwnerId(), document.getTagList()))
                .collect(Collectors.toList());
    }

    @GetMapping("/metadata/all/{id}")
    public ResponseEntity<List<Metadata>> getAllMetadataByDocumentId(@PathVariable String id) {
        List<Metadata> metadataList = metadataService.getAllByDocumentId(id);
        return new ResponseEntity<>(metadataList, HttpStatus.OK);
    }

    @GetMapping("/metadata/get/{metadataId}")
    public ResponseEntity<Metadata> getMetadataById(@PathVariable String metadataId) {
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
    public ResponseEntity<Void> addTag(@PathVariable String id, @RequestBody DocumentTagRequest request) {
        request.validate();
        DocumentData documentData = documentDataService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Document", id));
        Tag tag = tagService.getById(request.tagId())
                .orElseThrow(() -> new DataNotFoundException("DocumentTag", request.tagId()));
        if (tag.getOwnerId() != null) {
            throw new UnauthorizedException("Provided tag is not public!");
        }
        documentDataService.addTag(documentData, tag)
                .orElseThrow(() -> new RuntimeException("Failed to add tag!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/tag/remove/{id}")
    public ResponseEntity<Void> removeTag(@PathVariable String id, @RequestBody DocumentTagRequest request) {
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
        if (documentDataService.doesNotExist(request.relatedDocumentId())) {
            throw new DataNotFoundException("Document", request.relatedDocumentId());
        }
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
        if (documentDataService.doesNotExist(request.originalId())) {
            throw new DataNotFoundException("Document", request.originalId());
        }
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
