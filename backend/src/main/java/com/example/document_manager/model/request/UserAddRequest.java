package com.example.document_manager.model.request;

import com.example.document_manager.exception.InvalidInputException;

public record UserAddRequest(
        String username
) implements RequestData {
    @Override
    public void validate() {
        if (username == null || username.isBlank()) {
            throw new InvalidInputException(true, "username");
        }
    }
}
