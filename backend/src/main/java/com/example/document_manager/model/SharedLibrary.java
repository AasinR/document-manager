package com.example.document_manager.model;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document("libraries")
public class SharedLibrary {
    private String id;
    private List<LibraryUser> userList;
    private List<LibraryDocumentData> documentDataList;
}
