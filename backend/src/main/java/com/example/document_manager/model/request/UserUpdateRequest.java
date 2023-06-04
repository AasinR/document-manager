package com.example.document_manager.model.request;

public record UserUpdateRequest(
        String shownName,
        String email
) {
}
