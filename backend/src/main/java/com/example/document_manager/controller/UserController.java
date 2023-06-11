package com.example.document_manager.controller;

import com.example.document_manager.exception.DataExistsException;
import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.UnauthorizedException;
import com.example.document_manager.model.User;
import com.example.document_manager.model.request.UserAddRequest;
import com.example.document_manager.model.request.UserUpdateRequest;
import com.example.document_manager.model.response.UserResponse;
import com.example.document_manager.service.GroupService;
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
    private final GroupService groupService;
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
        request.validate();
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
    public ResponseEntity<Void> update(@RequestBody UserUpdateRequest request) {
        request.validate();
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
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
        if (groupService.isUserOwner(user.getUsername())) {
            throw new UnauthorizedException("User cannot be deleted while being an owner of a group!");
        }
        userService.delete(user.getUsername());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/admin/delete/{username}")
    public ResponseEntity<Void> adminDelete(@PathVariable String username) {
        User user = userService.getByUsername(username)
                .orElseThrow(() -> new DataNotFoundException("User", username));
        if (groupService.isUserOwner(user.getUsername())) {
            throw new UnauthorizedException("User cannot be deleted while being an owner of a group!");
        }
        userService.delete(username);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
