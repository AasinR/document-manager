package com.example.document_manager.model;

import com.example.document_manager.enums.Visibility;
import lombok.Data;

import java.time.LocalDate;

@Data
public class Comment {
    private String id;
    private String userName;
    private String content;
    private LocalDate date;
    private Visibility visibility;
}
