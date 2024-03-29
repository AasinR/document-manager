package com.example.document_manager.model.request;

import com.example.document_manager.exception.InvalidInputException;

public record TagRequest(
        String name
) implements RequestData {
    @Override
    public void validate() {
        if (name == null || name.isBlank()) {
            throw new InvalidInputException(true, "name");
        }
    }
}
