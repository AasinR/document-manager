package com.example.document_manager.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@Document("deleted-documents")
public class DeletedDocument {
    @Id
    private String id;
    @Indexed(unique = true)
    private String documentId;
    private LocalDate date;

    public DeletedDocument(String documentId) {
        this.documentId = documentId;
        this.date = LocalDate.now();
    }
}
