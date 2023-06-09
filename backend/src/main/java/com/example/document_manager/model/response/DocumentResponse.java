package com.example.document_manager.model.response;

import com.example.document_manager.model.Metadata;

public record DocumentResponse(
        String id,
        String fileId,
        Metadata metadata,
        DocumentTagCollection tagCollection
) {
}
