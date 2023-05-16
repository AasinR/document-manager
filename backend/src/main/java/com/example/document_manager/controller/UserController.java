package com.example.document_manager.controller;

import com.example.document_manager.exception.DataExistsException;
import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.InvalidInputException;
import com.example.document_manager.model.User;
import com.example.document_manager.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/v1/users")
@AllArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        List<User> userList = userService.getAll();
        return new ResponseEntity<>(userList, HttpStatus.OK);
    }

    @GetMapping("/get/{username}")
    public ResponseEntity<?> getByUsername(@PathVariable String username) {
        User user = userService.getByUsername(username)
                .orElseThrow(() -> new DataNotFoundException("User", username));
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addUser(@RequestBody Map<String, String> requestBody) {
        String username = requestBody.get("username");
        if (username == null || username.isBlank()) {
            throw new InvalidInputException(true, "username");
        }

        User user = userService.addUser(username)
                .orElseThrow(() -> new DataExistsException("User", username));
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    @PutMapping("/update/{username}")
    public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody User requestBody) {
        User user = userService.getByUsername(username)
                .orElseThrow(() -> new DataNotFoundException("User", username));

        String shownName = requestBody.getShownName();
        String email = requestBody.getEmail();
        if ((shownName != null && shownName.isBlank()) || (email != null && email.isBlank())) {
            throw new InvalidInputException(false, "shownName", "email");
        }

        user.setShownName(shownName);
        user.setEmail(email);
        userService.updateUser(user)
                .orElseThrow(() -> new RuntimeException("Failed to update user!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/delete/{username}")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        userService.deleteUser(username);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
