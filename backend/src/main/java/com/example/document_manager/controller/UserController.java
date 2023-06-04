package com.example.document_manager.controller;

import com.example.document_manager.exception.DataExistsException;
import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.InvalidInputException;
import com.example.document_manager.model.User;
import com.example.document_manager.model.request.UserAddRequest;
import com.example.document_manager.model.request.UserUpdateRequest;
import com.example.document_manager.model.response.UserResponse;
import com.example.document_manager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/all")
    public ResponseEntity<List<UserResponse>> getAll() {
        List<User> userList = userService.getAll();
        List<UserResponse> response = userList.stream()
                .map(user -> new UserResponse(
                        user.getUsername(),
                        user.getShownName(),
                        user.getEmail(),
                        user.getPermission().name()
                ))
                .toList();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/get/{username}")
    public ResponseEntity<UserResponse> getByUsername(@PathVariable String username) {
        User user = userService.getByUsername(username)
                .orElseThrow(() -> new DataNotFoundException("User", username));
        UserResponse response = new UserResponse(
                user.getUsername(),
                user.getShownName(),
                user.getEmail(),
                user.getPermission().name()
        );
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/admin/add")
    public ResponseEntity<UserResponse> add(@RequestBody UserAddRequest request) {
        if (request.username() == null || request.username().isBlank()) {
            throw new InvalidInputException(true, "username");
        }
        User user = userService.add(request.username())
                .orElseThrow(() -> new DataExistsException("User", request.username()));
        UserResponse response = new UserResponse(
                user.getUsername(),
                user.getShownName(),
                user.getEmail(),
                user.getPermission().name()
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/update")
    public ResponseEntity<Void> userUpdate(@RequestBody UserUpdateRequest request) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return update(user, request);
    }

    @PutMapping("/admin/update/{username}")
    public ResponseEntity<Void> adminUpdate(@PathVariable String username, @RequestBody UserUpdateRequest request) {
        User user = userService.getByUsername(username)
                .orElseThrow(() -> new DataNotFoundException("User", username));
        return update(user, request);
    }

    private ResponseEntity<Void> update(User user, UserUpdateRequest request) {
        // shownName and email can be null but cannot be empty string
        if ((request.shownName() != null && request.shownName().isBlank()) || (request.email() != null && request.email().isBlank())) {
            throw new InvalidInputException(false, "shownName", "email");
        }
        user.setShownName(request.shownName());
        user.setEmail(request.email());
        userService.update(user)
                .orElseThrow(() -> new RuntimeException("Failed to update user!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/admin/promote/{username}")
    public ResponseEntity<Void> promote(@PathVariable String username) {
        User user = userService.getByUsername(username)
                .orElseThrow(() -> new DataNotFoundException("User", username));
        userService.promote(user)
                .orElseThrow(() -> new RuntimeException("Failed to promote user!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> delete() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        userService.delete(user.getUsername());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/admin/delete/{username}")
    public ResponseEntity<Void> adminDelete(@PathVariable String username) {
        userService.delete(username);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
