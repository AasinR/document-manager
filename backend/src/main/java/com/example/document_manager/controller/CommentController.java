package com.example.document_manager.controller;

import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.InvalidInputException;
import com.example.document_manager.exception.UnauthorizedException;
import com.example.document_manager.model.Comment;
import com.example.document_manager.model.Group;
import com.example.document_manager.model.request.CommentRequest;
import com.example.document_manager.service.CommentService;
import com.example.document_manager.service.DocumentDataService;
import com.example.document_manager.service.GroupService;
import com.example.document_manager.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/comments")
@AllArgsConstructor
public class CommentController {
    private final CommentService commentService;
    private final DocumentDataService documentDataService;
    private final UserService userService;
    private final GroupService groupService;

    @GetMapping("/all/public/{documentId}")
    public ResponseEntity<List<Comment>> getAllPublicByDocumentId(@PathVariable String documentId) {
        List<Comment> commentList = commentService.getAllByOwnerId(documentId, null);
        return new ResponseEntity<>(commentList, HttpStatus.OK);
    }

    @GetMapping("/all/private/{documentId}")
    public ResponseEntity<List<Comment>> getAllByOwnerId(@PathVariable String documentId, @RequestParam String ownerId) {
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
    public ResponseEntity<Comment> addPublicComment(@RequestBody CommentRequest requestBody) {
        validateCommentRequest(requestBody.documentId(), requestBody.username(), requestBody.content());

        Comment comment = commentService.add(requestBody.documentId(), null, requestBody.username(), requestBody.content())
                .orElseThrow(() -> new RuntimeException("Failed to create comment!"));
        return new ResponseEntity<>(comment, HttpStatus.CREATED);
    }

    @PostMapping("/add/user")
    public ResponseEntity<Comment> addPrivateComment(@RequestBody CommentRequest requestBody) {
        validateCommentRequest(requestBody.documentId(), requestBody.username(), requestBody.content());

        Comment comment = commentService.add(requestBody.documentId(), requestBody.username(), requestBody.username(), requestBody.content())
                .orElseThrow(() -> new RuntimeException("Failed to create comment!"));
        return new ResponseEntity<>(comment, HttpStatus.CREATED);
    }

    @PostMapping("/add/group")
    public ResponseEntity<Comment> addGroupComment(@RequestBody CommentRequest requestBody) {
        if (requestBody.ownerId() == null || requestBody.ownerId().isBlank()) {
            throw new InvalidInputException(true, "ownerId");
        }
        Group group = groupService.getById(requestBody.ownerId())
                .orElseThrow(() -> new DataNotFoundException("Group", requestBody.ownerId()));

        validateCommentRequest(requestBody.documentId(), requestBody.username(), requestBody.content());

        if (!groupService.containsUser(group, requestBody.username())) {
            throw new UnauthorizedException("User is not part of the group!");
        }

        Comment comment = commentService.add(requestBody.documentId(), requestBody.ownerId(), requestBody.username(), requestBody.content())
                .orElseThrow(() -> new RuntimeException("Failed to create comment!"));
        return new ResponseEntity<>(comment, HttpStatus.CREATED);
    }

    private void validateCommentRequest(String documentId, String username, String content) {
        documentDataService.getById(documentId)
                .orElseThrow(() -> new DataNotFoundException("Document", documentId));

        if (username == null || username.isBlank() || content == null || content.isBlank()) {
            throw new InvalidInputException(true, "username", "content");
        }
        userService.getByUsername(username)
                .orElseThrow(() -> new DataNotFoundException("User", username));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Void> update(@PathVariable String id, @RequestBody CommentRequest requestBody) {
        Comment comment = commentService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Comment", id));

        if (requestBody.content() == null || requestBody.content().isBlank()) {
            throw new InvalidInputException(true, "content");
        }

        comment.setContent(requestBody.content());
        commentService.update(comment)
                .orElseThrow(() -> new RuntimeException("Failed to update comment!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        commentService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
