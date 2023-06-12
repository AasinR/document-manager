package com.example.document_manager.controller;

import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.InvalidInputException;
import com.example.document_manager.exception.UnauthorizedException;
import com.example.document_manager.model.Comment;
import com.example.document_manager.model.User;
import com.example.document_manager.model.request.CommentAddRequest;
import com.example.document_manager.model.request.CommentUpdateRequest;
import com.example.document_manager.model.response.CommentResponse;
import com.example.document_manager.model.response.UserData;
import com.example.document_manager.service.CommentService;
import com.example.document_manager.service.DocumentDataService;
import com.example.document_manager.service.GroupService;
import com.example.document_manager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/v1/comments")
@RequiredArgsConstructor
public class CommentController {
    private final DocumentDataService documentDataService;
    private final CommentService commentService;
    private final GroupService groupService;
    private final UserService userService;

    @GetMapping("/all/public/{documentId}")
    public ResponseEntity<List<CommentResponse>> getAllPublicByDocumentId(@PathVariable String documentId) {
        List<Comment> commentList = commentService.getAllByOwnerId(documentId, null);
        List<CommentResponse> response = getCommentResponseList(commentList);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/all/private/{documentId}")
    public ResponseEntity<List<CommentResponse>> getAllByOwner(@PathVariable String documentId, @RequestParam(required = false) String groupId) {
        String ownerId = groupService.resolveOwnerId(groupId);
        List<Comment> commentList = commentService.getAllByOwnerId(documentId, ownerId);
        List<CommentResponse> response = getCommentResponseList(commentList);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/admin/all/private/{documentId}")
    public ResponseEntity<List<CommentResponse>> adminGetAllByOwner(@PathVariable String documentId, @RequestParam String ownerId) {
        if (ownerId == null || ownerId.isBlank()) {
            throw new InvalidInputException(true, "ownerId");
        }
        List<Comment> commentList = commentService.getAllByOwnerId(documentId, ownerId);
        List<CommentResponse> response = getCommentResponseList(commentList);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    private List<CommentResponse> getCommentResponseList(List<Comment> commentList) {
        Map<String, User> userMap = getUserMap(commentList);
        return commentList.stream()
                .map(comment -> {
                    User user = userMap.get(comment.getUsername());
                    if (user == null) {
                        user = new User();
                    }
                    return new CommentResponse(
                            comment.getId(),
                            comment.getOwnerId(),
                            comment.getDocumentId(),
                            new UserData(user.getUsername(), user.getShownName()),
                            comment.getContent(),
                            comment.getTimestamp()
                    );
                })
                .toList();
    }

    private Map<String, User> getUserMap(List<Comment> commentList) {
        List<String> usernames = commentList.stream()
                .map(Comment::getUsername)
                .distinct()
                .toList();
        List<User> userList = userService.getAll(usernames);
        return userList.stream().collect(Collectors.toMap(User::getUsername, Function.identity()));
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<CommentResponse> getById(@PathVariable String id) {
        Comment comment = commentService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Comment", id));
        User user = userService.getByUsername(comment.getUsername()).orElse(new User());
        CommentResponse response = new CommentResponse(
                comment.getId(),
                comment.getOwnerId(),
                comment.getDocumentId(),
                new UserData(user.getUsername(), user.getShownName()),
                comment.getContent(),
                comment.getTimestamp()
        );
        return new ResponseEntity<>(response, HttpStatus.OK);
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
