package com.example.document_manager.model.request;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record CreateDocumentRequest(
        String title,
        List<String> authorList,
        String description,
        LocalDate publicationDate,
        Map<String, String> identifierList,
        Map<String, String> otherData
) {
}
