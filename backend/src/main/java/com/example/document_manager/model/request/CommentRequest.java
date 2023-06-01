package com.example.document_manager.model.request;

public record CommentRequest(
        String documentId,
        String ownerId,
        String username,
        String content
) {
}
