package com.example.document_manager.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Data
@NoArgsConstructor
@Document("metadata-versions")
public class Metadata {
    @Id
    private String id;
    private String username;
    @Indexed
    private String documentId;
    private LocalDateTime timestamp;
    private Set<String> relatedDocumentList;

    private String title;
    private List<String> authorList;
    private String description;
    private LocalDate publicationDate;
    private Map<String, String> identifierList;
    private Map<String, String> otherData;

    public Metadata(String username, String documentId, String title, List<String> authorList, String description, LocalDate publicationDate, Map<String, String> identifierList, Map<String, String> otherData) {
        this.username = username;
        this.documentId = documentId;
        this.title = title;
        this.authorList = Objects.requireNonNullElseGet(authorList, ArrayList::new);
        this.description = description;
        this.publicationDate = publicationDate;
        this.identifierList = Objects.requireNonNullElseGet(identifierList, HashMap::new);
        this.otherData = Objects.requireNonNullElseGet(otherData, HashMap::new);

        this.timestamp = LocalDateTime.now();
        this.relatedDocumentList = new HashSet<>();
    }

}
