package com.example.document_manager.model.response;

import com.example.document_manager.enums.GroupPermission;

public record GroupMemberResponse(
        String username,
        String shownName,
        GroupPermission permission
) {
}
