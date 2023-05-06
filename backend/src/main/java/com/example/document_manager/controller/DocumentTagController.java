package com.example.document_manager.controller;

import com.example.document_manager.model.DocumentTag;
import com.example.document_manager.model.Group;
import com.example.document_manager.model.User;
import com.example.document_manager.service.DocumentTagService;
import com.example.document_manager.service.GroupService;
import com.example.document_manager.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

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
        Optional<DocumentTag> documentTag = documentTagService.getById(id);
        if (documentTag.isPresent()) {
            return new ResponseEntity<>(documentTag, HttpStatus.OK);
        }
        return new ResponseEntity<>(String.format("Tag with id \"%s\" does not exist!", id), HttpStatus.NOT_FOUND);
    }

    @PostMapping("/add/user/{username}")
    public ResponseEntity<?> addUserTag(@PathVariable String username, @RequestBody Map<String, String> requestBody) {
        Optional<User> user = userService.getByUsername(username);
        if (user.isEmpty()) {
            return new ResponseEntity<>(String.format("User with username \"%s\" does not exist!", username), HttpStatus.NOT_FOUND);
        }

        String tagName = requestBody.get("name");
        if (tagName == null || tagName.isBlank()) {
            return new ResponseEntity<>("The given field is required and cannot be empty!", HttpStatus.BAD_REQUEST);
        }

        Optional<DocumentTag> documentTag = documentTagService.addTag(username, tagName);
        if (documentTag.isPresent()) {
            return new ResponseEntity<>(documentTag, HttpStatus.CREATED);
        }
        return new ResponseEntity<>("Failed to create tag!", HttpStatus.CONFLICT);
    }

    @PostMapping("/add/group/{groupId}")
    public ResponseEntity<?> addGroupTag(@PathVariable String groupId, @RequestBody Map<String, String> requestBody) {
        Optional<Group> group = groupService.getById(groupId);
        if (group.isEmpty()) {
            return new ResponseEntity<>(String.format("Group with id \"%s\" does not exist!", groupId), HttpStatus.NOT_FOUND);
        }

        String tagName = requestBody.get("name");
        if (tagName == null || tagName.isBlank()) {
            return new ResponseEntity<>("The given field is required and cannot be empty!", HttpStatus.BAD_REQUEST);
        }

        Optional<DocumentTag> documentTag = documentTagService.addTag(groupId, tagName);
        if (documentTag.isPresent()) {
            return new ResponseEntity<>(documentTag, HttpStatus.CREATED);
        }
        return new ResponseEntity<>("Failed to create tag!", HttpStatus.CONFLICT);
    }

    @PostMapping("/add/public")
    public ResponseEntity<?> addPublicTag(@RequestBody Map<String, String> requestBody) {
        String tagName = requestBody.get("name");
        if (tagName == null || tagName.isBlank()) {
            return new ResponseEntity<>("The given field is required and cannot be empty!", HttpStatus.BAD_REQUEST);
        }

        Optional<DocumentTag> documentTag = documentTagService.addTag(null, tagName);
        if (documentTag.isPresent()) {
            return new ResponseEntity<>(documentTag, HttpStatus.CREATED);
        }
        return new ResponseEntity<>("Failed to create tag!", HttpStatus.CONFLICT);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTag(@PathVariable String id, @RequestBody DocumentTag requestBody) {
        Optional<DocumentTag> documentTag = documentTagService.getById(id);
        if (documentTag.isEmpty()) {
            return new ResponseEntity<>(String.format("Tag with id \"%s\" does not exist!", id), HttpStatus.NOT_FOUND);
        }

        String tagName = requestBody.getName();
        if (tagName == null || tagName.isBlank()) {
            return new ResponseEntity<>("The given field is required and cannot be empty!", HttpStatus.BAD_REQUEST);
        }

        documentTag.get().setName(tagName);
        Optional<DocumentTag> updatedDocumentTag = documentTagService.updateTag(documentTag.get());
        if (updatedDocumentTag.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>("Failed to update tag!", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteTag(@PathVariable String id) {
        documentTagService.deleteTag(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
