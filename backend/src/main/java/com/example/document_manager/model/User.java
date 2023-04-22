package com.example.document_manager.model;

import com.example.document_manager.enums.UserPermission;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("users")
public class User {
    @Id
    private String id;
    private String username;
    private String shownName;
    private String email;
    private UserPermission permission;

    public User(String username, String shownName, String email, UserPermission permission) {
        this.username = username;
        this.shownName = shownName;
        this.email = email;
        this.permission = permission;
    }

    public User(String username) {
        this.username = username;
        this.shownName = username;
        this.permission = UserPermission.USER;
    }
}
