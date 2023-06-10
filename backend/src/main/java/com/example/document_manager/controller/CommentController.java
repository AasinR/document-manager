package com.example.document_manager.controller;

import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.InvalidInputException;
import com.example.document_manager.exception.UnauthorizedException;
import com.example.document_manager.model.Comment;
import com.example.document_manager.model.User;
import com.example.document_manager.model.request.CommentAddRequest;
import com.example.document_manager.model.request.CommentUpdateRequest;
import com.example.document_manager.service.CommentService;
import com.example.document_manager.service.DocumentDataService;
import com.example.document_manager.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("api/v1/comments")
@RequiredArgsConstructor
public class CommentController {
    private final DocumentDataService documentDataService;
    private final CommentService commentService;
    private final GroupService groupService;

    @GetMapping("/all/public/{documentId}")
    public ResponseEntity<List<Comment>> getAllPublicByDocumentId(@PathVariable String documentId) {
        List<Comment> commentList = commentService.getAllByOwnerId(documentId, null);
        return new ResponseEntity<>(commentList, HttpStatus.OK);
    }

    @GetMapping("/all/private/{documentId}")
    public ResponseEntity<List<Comment>> getAllByOwner(@PathVariable String documentId, @RequestParam(required = false) String groupId) {
        String ownerId = groupService.resolveOwnerId(groupId);
        List<Comment> commentList = commentService.getAllByOwnerId(documentId, ownerId);
        return new ResponseEntity<>(commentList, HttpStatus.OK);
    }

    @GetMapping("/admin/all/private/{documentId}")
    public ResponseEntity<List<Comment>> adminGetAllByOwner(@PathVariable String documentId, @RequestParam String ownerId) {
        if (ownerId == null || ownerId.isBlank()) {
            throw new InvalidInputException(true, "ownerId");
        }
        List<Comment> commentList = commentService.getAllByOwnerId(documentId, ownerId);
        return new ResponseEntity<>(commentList, HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<Comment> getById(@PathVariable String id) {
        Comment comment = commentService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Comment", id));
        return new ResponseEntity<>(comment, HttpStatus.OK);
    }

    @PostMapping("/add/public")
    public ResponseEntity<Comment> addPublic(@RequestBody CommentAddRequest request) {
        request.validate();
        if (documentDataService.doesNotExist(request.documentId())) {
            throw new DataNotFoundException("Document", request.documentId());
        }
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Comment comment = commentService.add(request.documentId(), null, user.getUsername(), request.content())
                .orElseThrow(() -> new RuntimeException("Failed to create comment!"));
        return new ResponseEntity<>(comment, HttpStatus.CREATED);
    }

    @PostMapping("/add/private")
    public ResponseEntity<Comment> addPrivate(@RequestParam(required = false) String groupId, @RequestBody CommentAddRequest request) {
        request.validate();
        if (documentDataService.doesNotExist(request.documentId())) {
            throw new DataNotFoundException("Document", request.documentId());
        }
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String ownerId = groupService.resolveOwnerId(groupId);
        Comment comment = commentService.add(request.documentId(), ownerId, user.getUsername(), request.content())
                .orElseThrow(() -> new RuntimeException("Failed to create comment!"));
        return new ResponseEntity<>(comment, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Void> update(@PathVariable String id, @RequestBody CommentUpdateRequest request) {
        request.validate();
        Comment comment = commentService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Comment", id));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (!Objects.equals(comment.getUsername(), user.getUsername())) {
            throw new UnauthorizedException("User is not authorized to update this comment!");
        }
        comment.setContent(request.content());
        commentService.update(comment)
                .orElseThrow(() -> new RuntimeException("Failed to update comment!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        Comment comment = commentService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Comment", id));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!Objects.equals(comment.getUsername(), user.getUsername())) {
            throw new UnauthorizedException("User is not authorized to delete this comment!");
        }
        commentService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<Void> adminDelete(@PathVariable String id) {
        commentService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
