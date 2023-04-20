package com.example.document_manager.model;

import com.example.document_manager.enums.Visibility;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document("documents")
public class DocumentData {
    @Id
    private String id;
    private Visibility visibility;
    private String fileId;
    private List<DocumentMetadata> metadataList;
    private int metadataVersion;
    private List<Comment> commentList;
}
