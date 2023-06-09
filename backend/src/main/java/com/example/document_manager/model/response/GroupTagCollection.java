package com.example.document_manager.model.response;

import com.example.document_manager.model.DocumentTag;

import java.util.Set;

public record GroupTagCollection(
        String groupId,
        Set<DocumentTag> groupTagList
) {
}
