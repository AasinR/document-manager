package com.example.document_manager.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@Document("document-tags")
public class DocumentTag {
    @Id
    private String id;
    @Indexed
    private String name;
    @Indexed
    private String ownerId;

    public DocumentTag(String name, String ownerId) {
        this.name = name;
        this.ownerId = ownerId;
    }
}
