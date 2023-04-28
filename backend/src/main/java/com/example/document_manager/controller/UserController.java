package com.example.document_manager.controller;

import com.example.document_manager.model.User;
import com.example.document_manager.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

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
        Optional<User> user = userService.getByUsername(username);
        if (user.isPresent()) {
            return new ResponseEntity<>(user, HttpStatus.OK);
        }
        return new ResponseEntity<>(String.format("User with username \"%s\" does not exist!", username), HttpStatus.NOT_FOUND);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addUser(@RequestBody Map<String, String> requestBody) {
        String username = requestBody.get("username");
        if (username == null || username.trim().isEmpty()) {
            return new ResponseEntity<>("The \"username\" field is required and cannot be empty!", HttpStatus.BAD_REQUEST);
        }

        Optional<User> user = userService.addUser(username);
        if (user.isPresent()) {
            return new ResponseEntity<>(user, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(String.format("User with username \"%s\" already exists!", username), HttpStatus.CONFLICT);
    }

    @PutMapping("/update/{username}")
    public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody User requestBody) {
        Optional<User> user = userService.getByUsername(username);
        if (user.isEmpty()) {
            return new ResponseEntity<>(String.format("User with username \"%s\" does not exist!", username), HttpStatus.NOT_FOUND);
        }

        String shownName = requestBody.getShownName();
        String email = requestBody.getEmail();
        if ((shownName != null && shownName.trim().isEmpty()) || (email != null && email.trim().isEmpty())) {
            return new ResponseEntity<>("The given fields cannot be empty!", HttpStatus.BAD_REQUEST);
        }

        user.get().setShownName(shownName);
        user.get().setEmail(email);
        Optional<User> updatedUser = userService.updateUser(user.get());
        if (updatedUser.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(String.format("Failed to update user \"%s\"!", username), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{username}")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        userService.deleteUser(username);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
