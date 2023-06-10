package com.example.document_manager.model.response;

import com.example.document_manager.model.Tag;

import java.util.Set;

public record GroupTagCollection(
        String groupId,
        Set<Tag> groupTagList
) {
}
