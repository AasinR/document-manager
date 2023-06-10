package com.example.document_manager.model.request;

import com.example.document_manager.exception.InvalidInputException;

public record DocumentTagRequest(
        String tagId
) implements RequestData {
    @Override
    public void validate() {
        if (tagId == null || tagId.isBlank()) {
            throw new InvalidInputException(true, "tagId");
        }
    }
}
