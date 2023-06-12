package com.example.document_manager.model.response;

import java.util.List;

public record GroupResponse(
        String id,
        String name,
        List<GroupMemberResponse> groupMemberList
) {
}
