package com.example.document_manager.model.request;

import com.example.document_manager.exception.InvalidInputException;

public record CommentAddRequest(
        String documentId,
        String content
) implements RequestData {
    @Override
    public void validate() {
        if (documentId == null || documentId.isBlank()) {
            throw new InvalidInputException(true, "documentId");
        }
        if (content == null || content.isBlank()) {
            throw new InvalidInputException(true, "content");
        }
    }
}
