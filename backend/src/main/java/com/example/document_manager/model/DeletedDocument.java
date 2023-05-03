package com.example.document_manager.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document("deleted-documents")
public class DeletedDocument {
    @Id
    private String id;
    private String documentId;
    private LocalDate date;
}
