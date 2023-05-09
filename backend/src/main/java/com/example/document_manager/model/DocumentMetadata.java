package com.example.document_manager.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Data
@NoArgsConstructor
@Document("metadata-versions")
public class DocumentMetadata {
    @Id
    private String id;
    private String username;
    @Indexed
    private String documentId;
    private LocalDateTime timestamp;
    @DBRef
    private Set<DocumentTag> tagList;
    private Set<String> relatedDocumentList;

    private String title;
    private List<String> authorList;
    private String description;
    private LocalDate publicationDate;
    private Map<String, String> identifierList;
    private Map<String, String> otherData;

    public DocumentMetadata(String username, String documentId, String title, List<String> authorList, String description, LocalDate publicationDate, Map<String, String> identifierList, Map<String, String> otherData) {
        this.username = username;
        this.documentId = documentId;
        this.title = title;
        this.authorList = authorList;
        this.description = description;
        this.publicationDate = publicationDate;
        this.identifierList = identifierList;
        this.otherData = otherData;

        this.timestamp = LocalDateTime.now();
    }
}
