package com.example.document_manager.model;

import com.example.document_manager.enums.UserPermission;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@NoArgsConstructor
@Document("users")
public class User implements UserDetails {
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

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(permission.name()));
    }

    @Override
    public String getPassword() {
        return null; // no password is stored
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
