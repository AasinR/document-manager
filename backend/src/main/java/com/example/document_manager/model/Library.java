package com.example.document_manager.model;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document("libraries")
public class Library {
    private String id;
    private String owner;
    private List<LibraryDocumentData> documentDataList;
}
