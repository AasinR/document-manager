package com.example.document_manager.model;

import com.example.document_manager.enums.GroupPermission;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMember {
    private String username;
    private GroupPermission permission;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GroupMember groupMember = (GroupMember) o;
        return Objects.equals(username, groupMember.username);
    }

    @Override
    public int hashCode() {
        return Objects.hash(username);
    }
}
