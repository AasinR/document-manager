package com.example.document_manager.service;

import com.example.document_manager.enums.GroupPermission;
import com.example.document_manager.model.Group;
import com.example.document_manager.model.GroupMember;
import com.example.document_manager.repository.GroupRepository;
import lombok.AllArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@AllArgsConstructor
public class GroupService {
    private final GroupRepository groupRepository;

    public List<Group> getAll() {
        return groupRepository.findAll();
    }

    public List<Group> getAllByUsername(String username) {
        return groupRepository.findAllByGroupMemberListUsername(username);
    }

    public Optional<Group> getById(String id) {
        return groupRepository.findById(id);
    }

    public Optional<Group> addGroup(String username, String groupName) {
        Set<GroupMember> groupMemberList = Set.of(new GroupMember(username, GroupPermission.OWNER));
        Group group = new Group(groupName, groupMemberList);
        try {
            return Optional.of(groupRepository.insert(group));
        }
        catch (DuplicateKeyException e) {
            return Optional.empty();
        }
    }

    public Optional<Group> updateGroup(Group group) {
        return Optional.of(groupRepository.save(group));
    }

    public Optional<Group> addGroupMember(Group group, String username) {
        boolean isAdded = group.getGroupMemberList().add(new GroupMember(username, GroupPermission.MEMBER));
        if (!isAdded) return Optional.empty();
        return Optional.of(groupRepository.save(group));
    }

    public Optional<Group> removeGroupMember(Group group, String username) {
        boolean isRemoved = group.getGroupMemberList().removeIf(groupMember -> groupMember.getUsername().equals(username));
        if (!isRemoved) return Optional.empty();
        return Optional.of(groupRepository.save(group));
    }

    public void deleteGroup(String id) {
        groupRepository.deleteById(id);
    }
}
