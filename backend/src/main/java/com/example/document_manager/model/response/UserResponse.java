package com.example.document_manager.model.response;

public record UserResponse(
        String username,
        String shownName,
        String email,
        String permission
) {
}
