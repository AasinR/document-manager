package com.example.document_manager.model;

import lombok.Data;

import java.util.List;

@Data
public class LibraryDocumentData {
    private String documentId;
    private List<String> privateTagList;
    private List<Comment> commentList;
}
