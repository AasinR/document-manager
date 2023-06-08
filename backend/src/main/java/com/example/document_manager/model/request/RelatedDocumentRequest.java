package com.example.document_manager.model.request;

import com.example.document_manager.exception.InvalidInputException;

public record RelatedDocumentRequest(
        String documentId,
        String relatedDocumentId
) {
    public void validate() {
        if (documentId == null || documentId.isBlank()) {
            throw new InvalidInputException(true, "documentId");
        }
        if (relatedDocumentId == null || relatedDocumentId.isBlank()) {
            throw new InvalidInputException(true, "relatedDocumentId");
        }
        if (documentId.equals(relatedDocumentId)) {
            throw new InvalidInputException("The given document IDs cannot be identical!");
        }
    }
}
