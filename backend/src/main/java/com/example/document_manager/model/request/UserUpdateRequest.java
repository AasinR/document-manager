package com.example.document_manager.model.request;

import com.example.document_manager.exception.InvalidInputException;

public record UserUpdateRequest(
        String shownName,
        String email
) implements RequestData {
    @Override
    public void validate() {
        if (shownName != null && shownName.isBlank()) {
            throw new InvalidInputException(false, "shownName");
        }
        if (email != null && email.isBlank()) {
            throw new InvalidInputException(false, "email");
        }
    }
}
