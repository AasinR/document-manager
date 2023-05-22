package com.example.document_manager.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@Document("saved-documents")
public class SavedDocument {
    @Id
    private String id;
    private String ownerId;
    private String documentId;
    private Set<String> tagList;

    public SavedDocument(String ownerId, String documentId) {
        this.ownerId = ownerId;
        this.documentId = documentId;
        this.tagList = new HashSet<>();
    }
}
