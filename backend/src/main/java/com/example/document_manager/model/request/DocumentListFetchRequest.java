package com.example.document_manager.model.request;

import com.example.document_manager.exception.InvalidInputException;

import java.util.List;

public record DocumentListFetchRequest(
        List<String> documentIdList
) implements RequestData {
    @Override
    public void validate() {
        if (isInvalidDocumentIdList()) {
            throw new InvalidInputException(true, "documentIdList");
        }
    }

    private boolean isInvalidDocumentIdList() {
        if (documentIdList == null) {
            return true;
        }
        for (String id : documentIdList) {
            if (id == null || id.isBlank()) {
                return true;
            }
        }
        return false;
    }
}
