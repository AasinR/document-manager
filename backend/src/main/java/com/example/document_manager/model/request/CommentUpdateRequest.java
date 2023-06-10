package com.example.document_manager.model.request;

import com.example.document_manager.exception.InvalidInputException;

public record CommentUpdateRequest(
        String content
) implements RequestData {
    @Override
    public void validate() {
        if (content == null || content.isBlank()) {
            throw new InvalidInputException(true, "content");
        }
    }
}
