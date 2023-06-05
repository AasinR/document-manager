package com.example.document_manager.enums;

public enum GroupPermission {
    OWNER,
    ADMIN,
    MEMBER;

    public boolean isHigherOrSame(GroupPermission other) {
        return (this == OWNER) || (this == ADMIN && other == MEMBER);
    }
}
