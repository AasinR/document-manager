package com.example.document_manager.model;

import com.example.document_manager.enums.Visibility;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@Document("documents")
public class DocumentData {
    @Id
    private String id;
    private String fileId;
    private String ownerId;
    @DBRef
    private DocumentMetadata metadata;
    private Visibility visibility;

    public DocumentData(String fileId, String ownerId, DocumentMetadata metadata, Visibility visibility) {
        this.fileId = fileId;
        this.ownerId = ownerId;
        this.metadata = metadata;
        this.visibility = visibility;
    }
}
