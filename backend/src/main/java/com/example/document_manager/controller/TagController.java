package com.example.document_manager.controller;

import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.UnauthorizedException;
import com.example.document_manager.model.Tag;
import com.example.document_manager.model.User;
import com.example.document_manager.model.request.TagRequest;
import com.example.document_manager.service.TagService;
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
public class TagController {
    private final TagService tagService;
    private final GroupService groupService;

    @GetMapping("/all/public")
    public ResponseEntity<List<Tag>> getAll() {
        List<Tag> tagList = tagService.getAllByOwner(null);
        return new ResponseEntity<>(tagList, HttpStatus.OK);
    }

    @GetMapping("/all/private")
    public ResponseEntity<List<Tag>> getAllByOwner(@RequestParam(required = false) String groupId) {
        String ownerId = groupService.resolveOwnerId(groupId);
        List<Tag> tagList = tagService.getAllByOwner(ownerId);
        return new ResponseEntity<>(tagList, HttpStatus.OK);
    }

    @GetMapping("/admin/all/private/{ownerId}")
    public ResponseEntity<List<Tag>> adminGetAllByOwner(@PathVariable String ownerId) {
        List<Tag> tagList = tagService.getAllByOwner(ownerId);
        return new ResponseEntity<>(tagList, HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<Tag> getById(@PathVariable String id) {
        Tag tag = tagService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Tag", id));
        return new ResponseEntity<>(tag, HttpStatus.OK);
    }

    @PostMapping("/add/public")
    public ResponseEntity<Tag> addPublic(@RequestBody TagRequest request) {
        request.validate();
        Tag tag = tagService.add(null, request.name())
                .orElseThrow(() -> new RuntimeException("Failed to create tag!"));
        return new ResponseEntity<>(tag, HttpStatus.CREATED);
    }

    @PostMapping("/add/private")
    public ResponseEntity<Tag> addPrivate(@RequestParam(required = false) String groupId, @RequestBody TagRequest request) {
        request.validate();
        String ownerId = groupService.resolveOwnerId(groupId);
        Tag tag = tagService.add(ownerId, request.name())
                .orElseThrow(() -> new RuntimeException("Failed to create tag!"));
        return new ResponseEntity<>(tag, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Void> update(@PathVariable String id, @RequestBody TagRequest request) {
        request.validate();
        Tag tag = tagService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Tag", id));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (tag.getOwnerId() != null && isUnauthorizedAccess(tag, user.getUsername())) {
            throw new UnauthorizedException("User is unauthorized to update this tag!");
        }
        tag.setName(request.name());
        tagService.update(tag)
                .orElseThrow(() -> new RuntimeException("Failed to update tag!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        Tag tag = tagService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Tag", id));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (isUnauthorizedAccess(tag, user.getUsername())) {
            throw new UnauthorizedException("User is unauthorized to delete this tag!");
        }
        tagService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<Void> adminDelete(@PathVariable String id) {
        tagService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    private boolean isUnauthorizedAccess(Tag tag, String username) {
        boolean validUser = Objects.equals(tag.getOwnerId(), username);
        boolean validGroup = groupService.containsUser(tag.getOwnerId(), username);
        return !(validUser || validGroup);
    }
}
