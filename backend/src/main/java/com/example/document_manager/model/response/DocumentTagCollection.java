package com.example.document_manager.model.response;

import com.example.document_manager.model.Tag;

import java.util.List;
import java.util.Set;

public record DocumentTagCollection(
        Set<Tag> tagList,
        Set<Tag> privateTagList,
        List<GroupTagCollection> groupTagCollectionList
) {
}
