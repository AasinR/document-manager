package com.example.document_manager.model.request;

import com.example.document_manager.exception.InvalidInputException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record MetadataRequest(
        String title,
        List<String> authorList,
        String description,
        LocalDate publicationDate,
        Map<String, String> identifierList,
        Map<String, String> otherData
) {
    public void validate() {
        if (isInvalidTitle()) {
            throw new InvalidInputException(true, "title");
        }
        if (isInvalidAuthorList()) {
            throw new InvalidInputException(false, "author");
        }
        if (isInvalidDescription()) {
            throw new InvalidInputException(false, "description");
        }
        if (isInvalidIdentifierList()) {
            throw new InvalidInputException(false, "identifier");
        }
        if (isInvalidOtherData()) {
            throw new InvalidInputException(false, "other");
        }
    }

    public boolean isInvalidTitle() {
        return title == null || title.isBlank();
    }

    public boolean isInvalidAuthorList() {
        if (authorList != null) {
            for (String author : authorList) {
                if (author == null || author.isBlank()) {
                    return true;
                }
            }
        }
        return false;
    }

    public boolean isInvalidDescription() {
        return description != null && description.isBlank();
    }

    public boolean isInvalidIdentifierList() {
        return validateMap(identifierList);
    }

    public boolean isInvalidOtherData() {
        return validateMap(otherData);
    }

    private boolean validateMap(Map<String, String> map) {
        if (map != null) {
            for (Map.Entry<String, String> entry : map.entrySet()) {
                String key = entry.getKey();
                String value = entry.getValue();
                if (key == null || key.isBlank() || value == null || value.isBlank()) {
                    return true;
                }
            }
        }
        return false;
    }
}
