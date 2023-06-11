package com.example.document_manager.service;

import com.example.document_manager.enums.GroupPermission;
import com.example.document_manager.exception.UnauthorizedException;
import com.example.document_manager.model.Group;
import com.example.document_manager.model.GroupMember;
import com.example.document_manager.model.User;
import com.example.document_manager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GroupService {
    private final SavedDocumentService savedDocumentService;
    private final CommentRepository commentRepository;
    private final GroupRepository groupRepository;
    private final TagRepository tagRepository;

    public List<Group> getAll() {
        return groupRepository.findAll();
    }

    public List<Group> getAllByUsername(String username) {
        return groupRepository.findAllByGroupMemberListUsername(username);
    }

    public Optional<Group> getById(String id) {
        return groupRepository.findById(id);
    }

    public List<String> getGroupIdsByUsername(String username) {
        List<String> groupIdList = new ArrayList<>();
        groupRepository.findAllIdByGroupMemberListUsername(username).forEach(
                groupIdProjection -> groupIdList.add(groupIdProjection.id())
        );
        return groupIdList;
    }

    public Optional<Group> add(String username, String groupName) {
        Set<GroupMember> groupMemberList = Set.of(new GroupMember(username, GroupPermission.OWNER));
        Group group = new Group(groupName, groupMemberList);
        try {
            return Optional.of(groupRepository.insert(group));
        }
        catch (DuplicateKeyException e) {
            return Optional.empty();
        }
    }

    public Optional<Group> update(Group group) {
        return Optional.of(groupRepository.save(group));
    }

    public Optional<Group> addMember(Group group, String username) {
        boolean isPresent = group.getGroupMemberList().add(new GroupMember(username, GroupPermission.MEMBER));
        if (isPresent) {
            return Optional.of(groupRepository.save(group));
        }
        return Optional.empty();
    }

    public Optional<Group> removeMember(Group group, String username) {
        boolean isRemoved = group.getGroupMemberList().removeIf(groupMember -> groupMember.getUsername().equals(username));
        if (isRemoved) {
            return Optional.of(groupRepository.save(group));
        }
        return Optional.empty();
    }

    public Optional<Group> promoteMember(Group group, String username) {
        boolean isOwnerChange = false;
        GroupMember owner = null;
        for (GroupMember member : group.getGroupMemberList()) {
            if (member.getPermission() == GroupPermission.OWNER) {
                owner = member;
            }
            if (member.getUsername().equals(username)) {
                switch (member.getPermission()) {
                    case OWNER -> {
                        return Optional.empty();
                    }
                    case ADMIN -> {
                        isOwnerChange = true;
                        member.setPermission(GroupPermission.OWNER);
                    }
                    case MEMBER -> member.setPermission(GroupPermission.ADMIN);
                }
                if (owner != null) break;
            }
        }
        if (isOwnerChange && owner != null) {
            owner.setPermission(GroupPermission.ADMIN);
        }
        return Optional.of(groupRepository.save(group));
    }

    public Optional<Group> demoteMember(Group group, String username) {
        for (GroupMember member : group.getGroupMemberList()) {
            if (member.getUsername().equals(username)) {
                switch (member.getPermission()) {
                    case OWNER, MEMBER -> {
                        return Optional.empty();
                    }
                    case ADMIN -> {
                        member.setPermission(GroupPermission.MEMBER);
                        return Optional.of(groupRepository.save(group));
                    }
                }
            }
        }
        return Optional.empty();
    }

    public void delete(String id) {
        commentRepository.deleteAllByOwnerId(id);
        tagRepository.deleteAllByOwnerId(id);
        savedDocumentService.deleteAllByOwner(id);
        groupRepository.deleteById(id);
    }

    public boolean containsUser(String id, String username) {
        return groupRepository.existsByIdAndGroupMemberListUsername(id, username);
    }

    public String resolveOwnerId(String groupId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String ownerId = user.getUsername();
        if (groupId != null) {
            if (!containsUser(groupId, user.getUsername())) {
                throw new UnauthorizedException("User is not a member of this group!");
            }
            ownerId = groupId;
        }
        return ownerId;
    }

    public Optional<GroupPermission> getUserPermission(Group group, String username) {
        for (GroupMember member : group.getGroupMemberList()) {
            if (member.getUsername().equals(username)) {
                return Optional.of(member.getPermission());
            }
        }
        return Optional.empty();
    }

    public boolean isUnauthorized(Group group, String username, GroupPermission... allowedPermissions) {
        Optional<GroupPermission> userPermission = getUserPermission(group, username);
        if (userPermission.isPresent()) {
            for (GroupPermission allowedPermission : allowedPermissions) {
                if (userPermission.get() == allowedPermission) {
                    return false;
                }
            }
        }
        return true;
    }

    public boolean isUnauthorized(GroupPermission userPermission, GroupPermission... allowedPermissions) {
        for (GroupPermission allowedPermission : allowedPermissions) {
            if (userPermission == allowedPermission) {
                return false;
            }
        }
        return true;
    }

    public boolean isUserOwner(String username) {
        return groupRepository.existsByGroupMemberListContaining(new GroupMember(username, GroupPermission.OWNER));
    }
}
