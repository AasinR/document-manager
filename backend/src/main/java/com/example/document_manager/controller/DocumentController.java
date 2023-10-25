package com.example.document_manager.controller;

import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.UnauthorizedException;
import com.example.document_manager.model.*;
import com.example.document_manager.model.request.*;
import com.example.document_manager.model.response.*;
import com.example.document_manager.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DeletedDocumentService deletedDocumentService;
    private final SavedDocumentService savedDocumentService;
    private final DocumentDataService documentDataService;
    private final MetadataService metadataService;
    private final CommentService commentService;
    private final GroupService groupService;
    private final FileService fileService;
    private final UserService userService;
    private final TagService tagService;

    @GetMapping("/all")
    public ResponseEntity<List<DocumentResponse>> getAll() {
        List<DocumentData> documentDataList = documentDataService.getAll();
        List<DocumentResponse> response = getDocumentResponseList(documentDataList);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/records")
    public ResponseEntity<List<DocumentResponse>> getAllInList(@RequestBody DocumentListFetchRequest request) {
        request.validate();
        List<DocumentData> documentDataList = documentDataService.getAll(request.documentIdList());
        List<DocumentResponse> response = getDocumentResponseList(documentDataList);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    private List<DocumentResponse> getDocumentResponseList(List<DocumentData> documentDataList) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<String> groupIdList = groupService.getGroupIdsByUsername(user.getUsername());
        List<SavedDocument> privateSavedDocumentList = savedDocumentService.getAllByOwner(user.getUsername());
        List<SavedDocument> groupSavedDocumentList = savedDocumentService.getAllByOwnerIdList(groupIdList);
        return documentDataList.stream()
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
                .toList();
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

    private PrivateTagCollection getPrivateTagSet(String documentId, List<SavedDocument> savedDocumentList) {
        return savedDocumentList.stream()
                .filter(document -> Objects.equals(document.getDocumentId(), documentId))
                .findFirst()
                .map(document -> new PrivateTagCollection(document.getId(), document.getTagList()))
                .orElse(null);
    }

    private PrivateTagCollection getPrivateTagSet(String documentId, String username) {
        return savedDocumentService.getByOwnerIdAndDocumentId(username, documentId)
                .map(document -> new PrivateTagCollection(document.getId(), document.getTagList()))
                .orElse(null);
    }

    private List<GroupTagCollection> getGroupTagCollectionList(String documentId, List<SavedDocument> savedDocumentList) {
        return savedDocumentList.stream()
                .filter(document -> Objects.equals(document.getDocumentId(), documentId))
                .map(document -> new GroupTagCollection(document.getOwnerId(), document.getId(), document.getTagList()))
                .collect(Collectors.toList());
    }

    private List<GroupTagCollection> getGroupTagCollectionList(List<String> groupIdList, String documentId) {
        return savedDocumentService.getAllByDocumentIdAndOwnerIdList(documentId, groupIdList)
                .stream()
                .map(document -> new GroupTagCollection(document.getOwnerId(), document.getId(), document.getTagList()))
                .collect(Collectors.toList());
    }

    @GetMapping("/metadata/all/{id}")
    public ResponseEntity<List<MetadataResponse>> getAllMetadataByDocumentId(@PathVariable String id) {
        List<Metadata> metadataList = metadataService.getAllByDocumentId(id);
        List<MetadataResponse> response = getMetadataResponseList(metadataList);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    private List<MetadataResponse> getMetadataResponseList(List<Metadata> metadataList) {
        Map<String, User> userMap = getUserMap(metadataList);
        return metadataList.stream()
                .map(metadata -> {
                    User user = userMap.get(metadata.getUsername());
                    if (user == null) {
                        user = new User();
                    }
                    return new MetadataResponse(
                            metadata.getId(),
                            new UserData(user.getUsername(), user.getShownName()),
                            metadata.getDocumentId(),
                            metadata.getTimestamp(),
                            metadata.getRelatedDocumentList(),
                            metadata.getTitle(),
                            metadata.getAuthorList(),
                            metadata.getDescription(),
                            metadata.getPublicationDate(),
                            metadata.getIdentifierList(),
                            metadata.getOtherData()
                    );
                })
                .toList();
    }

    private Map<String, User> getUserMap(List<Metadata> metadataList) {
        List<String> usernames = metadataList.stream()
                .map(Metadata::getUsername)
                .distinct()
                .toList();
        List<User> userList = userService.getAll(usernames);
        return userList.stream().collect(Collectors.toMap(User::getUsername, Function.identity()));
    }

    @GetMapping("/metadata/get/{metadataId}")
    public ResponseEntity<MetadataResponse> getMetadataById(@PathVariable String metadataId) {
        Metadata metadata = metadataService.getById(metadataId)
                .orElseThrow(() -> new DataNotFoundException("Metadata", metadataId));
        User user = userService.getByUsername(metadata.getUsername()).orElse(new User());
        MetadataResponse response = new MetadataResponse(
                metadata.getId(),
                new UserData(user.getUsername(), user.getShownName()),
                metadata.getDocumentId(),
                metadata.getTimestamp(),
                metadata.getRelatedDocumentList(),
                metadata.getTitle(),
                metadata.getAuthorList(),
                metadata.getDescription(),
                metadata.getPublicationDate(),
                metadata.getIdentifierList(),
                metadata.getOtherData()
        );
        return new ResponseEntity<>(response, HttpStatus.OK);
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
