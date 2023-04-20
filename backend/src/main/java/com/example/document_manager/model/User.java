package com.example.document_manager.model;

import com.example.document_manager.enums.UserPermission;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("users")
public class User {
    @Id
    private String userName;
    private String shownName;
    private String email;
    private UserPermission permission;
}
