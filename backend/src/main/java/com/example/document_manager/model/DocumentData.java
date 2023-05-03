package com.example.document_manager.model;

import com.example.document_manager.enums.Visibility;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("documents")
public class DocumentData {
    @Id
    private String id;
    private String fileId;
    private String ownerId;
    private String metadataId;
    private Visibility visibility;
}
