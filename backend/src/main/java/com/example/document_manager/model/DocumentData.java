package com.example.document_manager.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@Document("documents")
public class DocumentData {
    @Id
    private String id;
    private String fileId;
    @Indexed
    private byte[] fileHash;
    @DBRef
    private Metadata metadata;
    @DBRef
    private Set<DocumentTag> tagList;

    public DocumentData(String fileId, byte[] fileHash, Metadata metadata) {
        this.fileId = fileId;
        this.fileHash = fileHash;
        this.metadata = metadata;
        this.tagList = new HashSet<>();
    }
}
