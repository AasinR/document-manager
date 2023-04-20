package com.example.document_manager.model;

import com.example.document_manager.enums.LibraryPermission;
import lombok.Data;

@Data
public class LibraryUser {
    private String userName;
    private LibraryPermission permission;
}
