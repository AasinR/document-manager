package com.example.document_manager.model;

import com.example.document_manager.enums.UserPermission;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@Document("users")
public class User {
    @Id
    private String username;
    private String shownName;
    private String email;
    private UserPermission permission;

    public User(String username) {
        this.username = username;
        this.shownName = username;
        this.permission = UserPermission.USER;
    }

    public void setShownName(String shownName) {
        if (shownName == null) shownName = this.username;
        this.shownName = shownName;
    }
}
