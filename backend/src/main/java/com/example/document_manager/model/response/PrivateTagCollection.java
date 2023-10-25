package com.example.document_manager.model.response;

import com.example.document_manager.model.Tag;

import java.util.Set;

public record PrivateTagCollection(
        String saveId,
        Set<Tag> privateTagList
) {
}
