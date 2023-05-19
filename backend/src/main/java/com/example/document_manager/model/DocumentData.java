package com.example.document_manager.model;

import com.example.document_manager.enums.Visibility;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@Document("documents")
public class DocumentData {
    @Id
    private String id;
    private String fileId;
    @Indexed
    private String fileHash;
    private String ownerId;
    @DBRef
    private DocumentMetadata metadata;
    private Visibility visibility;

    public DocumentData(String fileId, String fileHash, String ownerId, DocumentMetadata metadata, Visibility visibility) {
        this.fileId = fileId;
        this.fileHash = fileHash;
        this.ownerId = ownerId;
        this.metadata = metadata;
        this.visibility = visibility;
    }
}
