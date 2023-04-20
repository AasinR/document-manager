package com.example.document_manager.model;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class DocumentMetadata {
    // modification data
    private String userName;
    private int metadataVersion;
    private LocalDate modificationDate;

    // document related data
    private String title;
    private List<String> authorList;
    private String description;
    private LocalDate publicationDate;
    private List<String> identifierList;
    private List<String> relatedDocumentList;
    private List<String> tagList;
}
