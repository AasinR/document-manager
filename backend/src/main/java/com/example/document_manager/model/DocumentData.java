package com.example.document_manager.model;

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
    private byte[] fileHash;
    private String ownerId;
    @DBRef
    private DocumentMetadata metadata;

    public DocumentData(String fileId, byte[] fileHash, String ownerId, DocumentMetadata metadata) {
        this.fileId = fileId;
        this.fileHash = fileHash;
        this.ownerId = ownerId;
        this.metadata = metadata;
    }
}
