package com.example.document_manager.model.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

public record MetadataResponse(
        String id,
        UserData user,
        String documentId,
        LocalDateTime timestamp,
        Set<String>relatedDocumentList,
        String title,
        List<String>authorList,
        String description,
        LocalDate publicationDate,
        Map<String, String>identifierList,
        Map<String, String> otherData
) {
}
