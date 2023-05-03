package com.example.document_manager.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Data
@Document("metadata-versions")
public class DocumentMetadata {
    @Id
    private String id;
    private String username;
    private String documentId;
    private LocalDate modificationDate;
    private Set<String> tagList;
    private String title;
    private List<String> authorList;
    private String description;
    private LocalDate publicationDate;
    private Set<String> relatedDocumentList;
    private Map<String, String> identifierList;
    private Map<String, String> otherData;
}
