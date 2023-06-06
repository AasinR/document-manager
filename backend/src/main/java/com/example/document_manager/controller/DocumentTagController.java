package com.example.document_manager.controller;

import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.InvalidInputException;
import com.example.document_manager.exception.UnauthorizedException;
import com.example.document_manager.model.DocumentTag;
import com.example.document_manager.model.User;
import com.example.document_manager.model.request.TagRequest;
import com.example.document_manager.service.DocumentTagService;
import com.example.document_manager.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("api/v1/tags")
@RequiredArgsConstructor
public class DocumentTagController {
    private final DocumentTagService documentTagService;
    private final GroupService groupService;

    @GetMapping("/all/public")
    public ResponseEntity<List<DocumentTag>> getAll() {
        List<DocumentTag> documentTagList = documentTagService.getAllByOwner(null);
        return new ResponseEntity<>(documentTagList, HttpStatus.OK);
    }

    @GetMapping("/all/private")
    public ResponseEntity<List<DocumentTag>> getAllByOwner(@RequestParam(required = false) String groupId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String ownerId = user.getUsername();
        if (groupId != null) {
            if (!groupService.containsUser(groupId, user.getUsername())) {
                throw new UnauthorizedException("User is unauthorized to list tags from this group!");
            }
            ownerId = groupId;
        }
        List<DocumentTag> documentTagList = documentTagService.getAllByOwner(ownerId);
        return new ResponseEntity<>(documentTagList, HttpStatus.OK);
    }

    @GetMapping("/admin/all/private/{ownerId}")
    public ResponseEntity<List<DocumentTag>> adminGetAllByOwner(@PathVariable String ownerId) {
        List<DocumentTag> documentTagList = documentTagService.getAllByOwner(ownerId);
        return new ResponseEntity<>(documentTagList, HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<DocumentTag> getById(@PathVariable String id) {
        DocumentTag documentTag = documentTagService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("DocumentTag", id));
        return new ResponseEntity<>(documentTag, HttpStatus.OK);
    }

    @PostMapping("/add/public")
    public ResponseEntity<DocumentTag> addPublic(@RequestBody TagRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new InvalidInputException(true, "name");
        }
        DocumentTag documentTag = documentTagService.add(null, request.name())
                .orElseThrow(() -> new RuntimeException("Failed to create tag!"));
        return new ResponseEntity<>(documentTag, HttpStatus.CREATED);
    }

    @PostMapping("/add/private")
    public ResponseEntity<DocumentTag> addPrivate(@RequestParam(required = false) String groupId, @RequestBody TagRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new InvalidInputException(true, "name");
        }
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String ownerId = user.getUsername();
        if (groupId != null) {
            if (!groupService.containsUser(groupId, user.getUsername())) {
                throw new UnauthorizedException("User is not part of this group!");
            }
            ownerId = groupId;
        }
        DocumentTag documentTag = documentTagService.add(ownerId, request.name())
                .orElseThrow(() -> new RuntimeException("Failed to create tag!"));
        return new ResponseEntity<>(documentTag, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Void> update(@PathVariable String id, @RequestBody TagRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new InvalidInputException(true, "name");
        }
        DocumentTag documentTag = documentTagService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("DocumentTag", id));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (documentTag.getOwnerId() != null && isUnauthorizedAccess(documentTag, user.getUsername())) {
            throw new UnauthorizedException("User is unauthorized to update this tag!");
        }
        documentTag.setName(request.name());
        documentTagService.update(documentTag)
                .orElseThrow(() -> new RuntimeException("Failed to update tag!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        DocumentTag documentTag = documentTagService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("DocumentTag", id));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (isUnauthorizedAccess(documentTag, user.getUsername())) {
            throw new UnauthorizedException("User is unauthorized to delete this tag!");
        }
        documentTagService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<Void> adminDelete(@PathVariable String id) {
        documentTagService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    private boolean isUnauthorizedAccess(DocumentTag documentTag, String username) {
        boolean validUser = Objects.equals(documentTag.getOwnerId(), username);
        boolean validGroup = groupService.containsUser(documentTag.getOwnerId(), username);
        return !(validUser || validGroup);
    }
}
