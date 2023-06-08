package com.example.document_manager.model.request;

import com.example.document_manager.exception.InvalidInputException;

public record DocumentDuplicateRequest(
        String originalId,
        String duplicateId,
        boolean migrateComments
) {
    public void validate() {
        if (originalId == null || originalId.isBlank()) {
            throw new InvalidInputException(true, "originalId");
        }
        if (duplicateId == null || duplicateId.isBlank()) {
            throw new InvalidInputException(true, "duplicateId");
        }
        if (originalId.equals(duplicateId)) {
            throw new InvalidInputException("The given document IDs cannot be identical!");
        }
    }
}
