package com.example.document_manager.controller;

import com.example.document_manager.model.Group;
import com.example.document_manager.model.User;
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
        Optional<User> user = userService.getByUsername(username);
        if (user.isEmpty()) {
            return new ResponseEntity<>(String.format("User with username \"%s\" does not exist!", username), HttpStatus.NOT_FOUND);
        }
        List<Group> groupList = groupService.getAllByUsername(username);
        return new ResponseEntity<>(groupList, HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        Optional<Group> group = groupService.getById(id);
        if (group.isPresent()) {
            return new ResponseEntity<>(group, HttpStatus.OK);
        }
        return new ResponseEntity<>(String.format("Group with id \"%s\" does not exist!", id), HttpStatus.NOT_FOUND);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addGroup(@RequestBody Map<String, String> requestBody) {
        String username = requestBody.get("username");
        String groupName = requestBody.get("groupName");
        if (username == null || username.isBlank() || groupName == null || groupName.isBlank()) {
            return new ResponseEntity<>("The given fields are required and cannot be empty!", HttpStatus.BAD_REQUEST);
        }

        Optional<User> user = userService.getByUsername(username);
        if (user.isEmpty()) {
            return new ResponseEntity<>(String.format("User with username \"%s\" does not exist!", username), HttpStatus.NOT_FOUND);
        }

        Optional<Group> group = groupService.addGroup(username, groupName);
        if (group.isPresent()) {
            return new ResponseEntity<>(group, HttpStatus.CREATED);
        }
        return new ResponseEntity<>("Failed to create group!", HttpStatus.CONFLICT);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateGroup(@PathVariable String id, @RequestBody Group requestBody) {
        Optional<Group> group = groupService.getById(id);
        if (group.isEmpty()) {
            return new ResponseEntity<>(String.format("Group with id \"%s\" does not exist!", id), HttpStatus.NOT_FOUND);
        }

        String groupName = requestBody.getName();
        if (groupName == null || groupName.isBlank()) {
            return new ResponseEntity<>("The given fields are required and cannot be empty!", HttpStatus.BAD_REQUEST);
        }

        group.get().setName(groupName);
        Optional<Group> updatedGroup = groupService.updateGroup(group.get());
        if (updatedGroup.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>("Failed to update group!", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @PutMapping("/member/add/{id}")
    public ResponseEntity<?> addMember(@PathVariable String id, @RequestBody Map<String, String> requestBody) {
        Optional<Group> group = groupService.getById(id);
        if (group.isEmpty()) {
            return new ResponseEntity<>(String.format("Group with ID \"%s\" not found!", id), HttpStatus.NOT_FOUND);
        }

        String username = requestBody.get("username");
        if (username == null || username.isBlank()) {
            return new ResponseEntity<>("The \"username\" field is required and cannot be empty!", HttpStatus.BAD_REQUEST);
        }
        Optional<User> user = userService.getByUsername(username);
        if (user.isEmpty()) {
            return new ResponseEntity<>(String.format("User with username \"%s\" not found!", username), HttpStatus.NOT_FOUND);
        }

        Optional<Group> updatedGroup = groupService.addGroupMember(group.get(), username);
        if (updatedGroup.isEmpty()) {
            return new ResponseEntity<>(String.format("Failed to add user with username \"%s\" to the group!", username), HttpStatus.CONFLICT);
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/member/remove/{id}")
    public ResponseEntity<?> removeMember(@PathVariable String id, @RequestBody Map<String, String> requestBody) {
        Optional<Group> group = groupService.getById(id);
        if (group.isEmpty()) {
            return new ResponseEntity<>(String.format("Group with ID \"%s\" not found!", id), HttpStatus.NOT_FOUND);
        }

        String username = requestBody.get("username");
        if (username == null || username.isBlank()) {
            return new ResponseEntity<>("The \"username\" field is required and cannot be empty!", HttpStatus.BAD_REQUEST);
        }
        Optional<User> user = userService.getByUsername(username);
        if (user.isEmpty()) {
            return new ResponseEntity<>(String.format("User with username \"%s\" not found!", username), HttpStatus.NOT_FOUND);
        }

        Optional<Group> updatedGroup = groupService.removeGroupMember(group.get(), username);
        if (updatedGroup.isEmpty()) {
            return new ResponseEntity<>(String.format("Failed to remove user with username \"%s\" from the group!", username), HttpStatus.CONFLICT);
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable String id) {
        groupService.deleteGroup(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
