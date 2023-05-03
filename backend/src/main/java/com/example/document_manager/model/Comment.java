package com.example.document_manager.model;

import com.example.document_manager.enums.Visibility;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document("comments")
public class Comment {
    @Id
    private String id;
    private String ownerId;
    private String documentId;
    private String userName;
    private String content;
    private LocalDate date;
    private Visibility visibility;
}
