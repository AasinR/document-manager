package com.example.document_manager.controller;

import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.InvalidInputException;
import com.example.document_manager.model.DocumentTag;
import com.example.document_manager.service.DocumentTagService;
import com.example.document_manager.service.GroupService;
import com.example.document_manager.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/v1/tags")
@AllArgsConstructor
public class DocumentTagController {
    private final DocumentTagService documentTagService;
    private final UserService userService;
    private final GroupService groupService;

    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        List<DocumentTag> documentTagList = documentTagService.getAll();
        return new ResponseEntity<>(documentTagList, HttpStatus.OK);
    }

    @GetMapping("/all/{ownerId}")
    public ResponseEntity<?> getAllByOwner(@PathVariable String ownerId) {
        List<DocumentTag> documentTagList = documentTagService.getAllByOwner(ownerId);
        return new ResponseEntity<>(documentTagList, HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        DocumentTag documentTag = documentTagService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("DocumentTag", id));
        return new ResponseEntity<>(documentTag, HttpStatus.OK);
    }

    @PostMapping("/add/user/{username}")
    public ResponseEntity<?> addUserTag(@PathVariable String username, @RequestBody Map<String, String> requestBody) {
        userService.getByUsername(username)
                .orElseThrow(() -> new DataNotFoundException("User", username));

        String tagName = requestBody.get("name");
        if (tagName == null || tagName.isBlank()) {
            throw new InvalidInputException(true, "name");
        }

        DocumentTag documentTag = documentTagService.addTag(username, tagName)
                .orElseThrow(() -> new RuntimeException("Failed to create tag!"));
        return new ResponseEntity<>(documentTag, HttpStatus.CREATED);
    }

    @PostMapping("/add/group/{groupId}")
    public ResponseEntity<?> addGroupTag(@PathVariable String groupId, @RequestBody Map<String, String> requestBody) {
        groupService.getById(groupId)
                .orElseThrow(() -> new DataNotFoundException("Group", groupId));

        String tagName = requestBody.get("name");
        if (tagName == null || tagName.isBlank()) {
            throw new InvalidInputException(true, "name");
        }

        DocumentTag documentTag = documentTagService.addTag(groupId, tagName)
                .orElseThrow(() -> new RuntimeException("Failed to create tag!"));
        return new ResponseEntity<>(documentTag, HttpStatus.CREATED);
    }

    @PostMapping("/add/public")
    public ResponseEntity<?> addPublicTag(@RequestBody Map<String, String> requestBody) {
        String tagName = requestBody.get("name");
        if (tagName == null || tagName.isBlank()) {
            throw new InvalidInputException(true, "name");
        }

        DocumentTag documentTag = documentTagService.addTag(null, tagName)
                .orElseThrow(() -> new RuntimeException("Failed to create tag!"));
        return new ResponseEntity<>(documentTag, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTag(@PathVariable String id, @RequestBody DocumentTag requestBody) {
        DocumentTag documentTag = documentTagService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("DocumentTag", id));

        String tagName = requestBody.getName();
        if (tagName == null || tagName.isBlank()) {
            throw new InvalidInputException(true, "name");
        }

        documentTag.setName(tagName);
        documentTagService.updateTag(documentTag)
                .orElseThrow(() -> new RuntimeException("Failed to update tag!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteTag(@PathVariable String id) {
        documentTagService.deleteTag(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
