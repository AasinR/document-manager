package com.example.document_manager.model.request;

public record CommentRequest(
        String documentId,
        String content
) {
}
