package com.example.document_manager.model.response;

import com.example.document_manager.model.DocumentTag;

import java.util.List;
import java.util.Set;

public record DocumentTagCollection(
        Set<DocumentTag> documentTagList,
        Set<DocumentTag> privateTagList,
        List<GroupTagCollection> groupTagCollectionList
) {
}
