package com.example.document_manager.model.request;

import com.example.document_manager.exception.InvalidInputException;

public record AuthenticationRequest(
        String username,
        String password
) implements RequestData {
    @Override
    public void validate() {
        if (username == null || username.isBlank()) {
            throw new InvalidInputException(true, "username");
        }
        if (password == null || password.isBlank()) {
            throw new InvalidInputException(true, "password");
        }
    }
}
