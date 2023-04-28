package com.example.document_manager.model;

import com.example.document_manager.enums.GroupPermission;
import lombok.Data;

@Data
public class GroupMember {
    private String userName;
    private GroupPermission permission;
}
