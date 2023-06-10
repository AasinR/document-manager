package com.example.document_manager.model.request;

import com.example.document_manager.exception.InvalidInputException;

public record GroupAddRequest(
        String groupName
) implements RequestData {
    @Override
    public void validate() {
        if (groupName == null || groupName.isBlank()) {
            throw new InvalidInputException(true, "groupName");
        }
    }
}
