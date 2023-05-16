package com.example.document_manager.controller;

import com.example.document_manager.exception.DataExistsException;
import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.InvalidInputException;
import com.example.document_manager.model.Group;
import com.example.document_manager.service.GroupService;
import com.example.document_manager.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/v1/groups")
@AllArgsConstructor
public class GroupController {
    private final GroupService groupService;
    private final UserService userService;

    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        List<Group> groupList = groupService.getAll();
        return new ResponseEntity<>(groupList, HttpStatus.OK);
    }

    @GetMapping("/all/{username}")
    public ResponseEntity<?> getAllByUsername(@PathVariable String username) {
        userService.getByUsername(username)
                .orElseThrow(() -> new DataNotFoundException("User", username));

        List<Group> groupList = groupService.getAllByUsername(username);
        return new ResponseEntity<>(groupList, HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        Group group = groupService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Group", id));
        return new ResponseEntity<>(group, HttpStatus.OK);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addGroup(@RequestBody Map<String, String> requestBody) {
        String username = requestBody.get("username");
        String groupName = requestBody.get("groupName");
        if (username == null || username.isBlank() || groupName == null || groupName.isBlank()) {
            throw new InvalidInputException();
        }

        userService.getByUsername(username)
                .orElseThrow(() -> new DataNotFoundException("User", username));

        Group group = groupService.addGroup(username, groupName)
                .orElseThrow(() -> new RuntimeException("Failed to create group!"));
        return new ResponseEntity<>(group, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateGroup(@PathVariable String id, @RequestBody Group requestBody) {
        Group group = groupService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Group", id));

        String groupName = requestBody.getName();
        if (groupName == null || groupName.isBlank()) {
            throw new InvalidInputException(true, "groupName");
        }

        group.setName(groupName);
        groupService.updateGroup(group)
               .orElseThrow(() -> new RuntimeException("Failed to update group!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/member/add/{id}")
    public ResponseEntity<?> addMember(@PathVariable String id, @RequestBody Map<String, String> requestBody) {
        Group group = groupService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Group", id));

        String username = requestBody.get("username");
        if (username == null || username.isBlank()) {
            throw new InvalidInputException(true, "username");
        }
        userService.getByUsername(username)
                .orElseThrow(() -> new DataNotFoundException("User", username));

        groupService.addGroupMember(group, username)
                .orElseThrow(() -> new DataExistsException(String.format("Failed to add user with username \"%s\" to the group!", username)));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/member/remove/{id}")
    public ResponseEntity<?> removeMember(@PathVariable String id, @RequestBody Map<String, String> requestBody) {
        Group group = groupService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Group", id));

        String username = requestBody.get("username");
        if (username == null || username.isBlank()) {
            throw new InvalidInputException(true, "username");
        }
        userService.getByUsername(username)
                .orElseThrow(() -> new DataNotFoundException("User", username));

        groupService.removeGroupMember(group, username)
                .orElseThrow(() -> new DataExistsException(String.format("Failed to remove user with username \"%s\" from the group!", username)));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable String id) {
        groupService.deleteGroup(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
