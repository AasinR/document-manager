package com.example.document_manager.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document("comments")
public class Comment {
    @Id
    private String id;
    @Indexed
    private String ownerId;
    @Indexed
    private String documentId;
    private String username;
    private String content;
    private LocalDateTime timestamp;

    public Comment(String ownerId, String documentId, String username, String content) {
        this.ownerId = ownerId;
        this.documentId = documentId;
        this.username = username;
        this.content = content;
        this.timestamp = LocalDateTime.now();
    }
}
