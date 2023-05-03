package com.example.document_manager.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("document-tags")
public class DocumentTag {
    @Id
    private String id;
    private String name;
    private String visibility;
    private String ownerId;
}
