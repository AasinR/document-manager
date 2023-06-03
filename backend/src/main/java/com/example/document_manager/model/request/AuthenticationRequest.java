package com.example.document_manager.model.request;

public record AuthenticationRequest(
        String username,
        String password
) {
}
