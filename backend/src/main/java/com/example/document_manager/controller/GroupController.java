package com.example.document_manager.controller;

import com.example.document_manager.enums.GroupPermission;
import com.example.document_manager.exception.DataExistsException;
import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.UnauthorizedException;
import com.example.document_manager.model.Group;
import com.example.document_manager.model.GroupMember;
import com.example.document_manager.model.User;
import com.example.document_manager.model.request.GroupAddRequest;
import com.example.document_manager.model.request.GroupMemberRequest;
import com.example.document_manager.model.request.GroupUpdateRequest;
import com.example.document_manager.model.response.GroupMemberResponse;
import com.example.document_manager.model.response.GroupResponse;
import com.example.document_manager.service.GroupService;
import com.example.document_manager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/v1/groups")
@RequiredArgsConstructor
public class GroupController {
    private final GroupService groupService;
    private final UserService userService;

    @GetMapping("/all")
    public ResponseEntity<List<GroupResponse>> getAll() {
        List<Group> groupList = groupService.getAll();
        List<GroupResponse> response = getGroupResponseList(groupList);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/all/{username}")
    public ResponseEntity<List<GroupResponse>> getAllByUsername(@PathVariable String username) {
        if (userService.doesNotExist(username)) {
            throw new DataNotFoundException("User", username);
        }
        List<Group> groupList = groupService.getAllByUsername(username);
        List<GroupResponse> response = getGroupResponseList(groupList);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    private List<GroupResponse> getGroupResponseList(List<Group> groupList) {
        Map<String, User> userMap = getUserMap(groupList);
        return groupList.stream()
                .map(group -> new GroupResponse(
                        group.getId(),
                        group.getName(),
                        fetchMemberList(group, userMap)
                ))
                .toList();
    }

    private Map<String, User> getUserMap(List<Group> groupList) {
        List<String> usernames = groupList.stream()
                .flatMap(group -> group.getGroupMemberList().stream())
                .map(GroupMember::getUsername)
                .distinct()
                .toList();
        List<User> userList = userService.getAll(usernames);
        return userList.stream().collect(Collectors.toMap(User::getUsername, Function.identity()));
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<GroupResponse> getById(@PathVariable String id) {
        Group group = groupService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Group", id));
        List<GroupMemberResponse> groupMemberList = fetchMemberList(group);
        GroupResponse response = new GroupResponse(
                group.getId(),
                group.getName(),
                groupMemberList
        );
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/member/get/{id}")
    public ResponseEntity<List<GroupMemberResponse>> getMembers(@PathVariable String id) {
        Group group = groupService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Group", id));
        List<GroupMemberResponse> response = fetchMemberList(group);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    private List<GroupMemberResponse> fetchMemberList(Group group, Map<String, User> userMap) {
        return group.getGroupMemberList().stream()
                .map(member -> {
                    User user = userMap.get(member.getUsername());
                    return new GroupMemberResponse(
                            member.getUsername(),
                            user.getShownName(),
                            member.getPermission()
                    );
                })
                .toList();
    }

    private List<GroupMemberResponse> fetchMemberList(Group group) {
        List<String> usernames = group.getGroupMemberList().stream()
                .map(GroupMember::getUsername)
                .toList();
        List<User> userList = userService.getAll(usernames);
        Map<String, User> userMap = userList.stream()
                .collect(Collectors.toMap(User::getUsername, Function.identity()));
        return fetchMemberList(group, userMap);
    }

    @PostMapping("/add")
    public ResponseEntity<Group> add(@RequestBody GroupAddRequest request) {
        request.validate();
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Group group = groupService.add(user.getUsername(), request.groupName())
                .orElseThrow(() -> new RuntimeException("Failed to create group!"));
        return new ResponseEntity<>(group, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Void> update(@PathVariable String id, @RequestBody GroupUpdateRequest request) {
        request.validate();
        Group group = groupService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Group", id));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (groupService.isUnauthorized(group, user.getUsername(), GroupPermission.OWNER, GroupPermission.ADMIN)) {
            throw new UnauthorizedException("User is not authorized to update this group!");
        }
        group.setName(request.groupName());
        groupService.update(group)
               .orElseThrow(() -> new RuntimeException("Failed to update group!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/member/add/{id}")
    public ResponseEntity<Void> addMember(@PathVariable String id, @RequestBody GroupMemberRequest request) {
        request.validate();
        Group group = groupService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Group", id));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (groupService.isUnauthorized(group, user.getUsername(), GroupPermission.OWNER, GroupPermission.ADMIN)) {
            throw new UnauthorizedException("User is not authorized to add new member to this group!");
        }
        if (userService.doesNotExist(request.username())) {
            throw new DataNotFoundException("User", request.username());
        }
        groupService.addMember(group, request.username())
                .orElseThrow(() -> new DataExistsException(String.format("Failed to add user with username \"%s\" to the group!", request.username())));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/member/remove/{id}")
    public ResponseEntity<Void> removeMember(@PathVariable String id, @RequestBody GroupMemberRequest request) {
        request.validate();
        Group group = groupService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Group", id));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        GroupPermission userPermission = groupService.getUserPermission(group, user.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User is not authorized to remove member from this group!"));
        if (groupService.isUnauthorized(userPermission, GroupPermission.OWNER, GroupPermission.ADMIN)) {
            throw new UnauthorizedException("User is not authorized to remove member from this group!");
        }
        GroupPermission removableUserPermission = groupService.getUserPermission(group, request.username())
                .orElseThrow(() -> new DataNotFoundException("The given user is not a member of this group!"));
        if (removableUserPermission.isHigherOrSame(userPermission)) {
            throw new UnauthorizedException("User is not authorized to remove the given member!");
        }
        groupService.removeMember(group, request.username())
                .orElseThrow(() -> new DataExistsException("Failed to remove user from the group!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/member/quit/{id}")
    public ResponseEntity<Void> quit(@PathVariable String id) {
        Group group = groupService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Group", id));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        GroupPermission userPermission = groupService.getUserPermission(group, user.getUsername())
                .orElseThrow(() -> new DataNotFoundException("User is not a member of this group!"));
        if (userPermission == GroupPermission.OWNER) {
            throw new UnauthorizedException("Owner is not allowed to quit the group!");
        }
        groupService.removeMember(group, user.getUsername())
                .orElseThrow(() -> new DataExistsException("Failed to remove user from the group!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/member/promote/{id}")
    public ResponseEntity<Void> promoteMember(@PathVariable String id, @RequestBody GroupMemberRequest request) {
        request.validate();
        Group group = groupService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Group", id));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        GroupPermission userPermission = groupService.getUserPermission(group, user.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User is not authorized to promote members in this group!"));
        if (userPermission == GroupPermission.MEMBER) {
            throw new UnauthorizedException("User is not authorized to promote members in this group!");
        }
        GroupPermission promotableUserPermission = groupService.getUserPermission(group, request.username())
                .orElseThrow(() -> new DataNotFoundException("The given user is not a member of this group!"));
        if (promotableUserPermission.isHigherOrSame(userPermission)) {
            throw new UnauthorizedException("User is not authorized to promote the given member!");
        }
        groupService.promoteMember(group, request.username())
                .orElseThrow(() -> new RuntimeException("Failed to promote user!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/member/demote/{id}")
    public ResponseEntity<Void> demoteMember(@PathVariable String id, @RequestBody GroupMemberRequest request) {
        request.validate();
        Group group = groupService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Group", id));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (groupService.isUnauthorized(group, user.getUsername(), GroupPermission.OWNER)) {
            throw new UnauthorizedException("User in not authorized to demote members in this group!");
        }
        groupService.demoteMember(group, request.username())
                .orElseThrow(() -> new RuntimeException("Failed to demote user!"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        Group group = groupService.getById(id)
                .orElseThrow(() -> new DataNotFoundException("Group", id));
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (groupService.isUnauthorized(group, user.getUsername(), GroupPermission.OWNER)) {
            throw new UnauthorizedException("User is not authorized to delete this group!");
        }
        if (group.getGroupMemberList().size() > 1) {
            throw new UnauthorizedException("Group must be empty before deletion!");
        }
        groupService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<Void> adminDelete(@PathVariable String id) {
        groupService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
