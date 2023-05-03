package com.example.document_manager.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Set;

@Data
@Document("saved-documents")
public class SavedDocument {
    @Id
    private String id;
    private String ownerId;
    private String documentId;
    private Set<String> tagList;
}
