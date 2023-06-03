package com.example.document_manager.security;

import com.example.document_manager.exception.InvalidInputException;
import lombok.RequiredArgsConstructor;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LDAPAuthenticationProvider implements AuthenticationProvider {
    private final LdapTemplate ldapTemplate;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String password = authentication.getCredentials().toString();

        boolean isAuthenticated = ldapTemplate.authenticate("", String.format("(uid=%s)", username), password);
        if (isAuthenticated) {
            return new UsernamePasswordAuthenticationToken(username, password);
        }
        throw new InvalidInputException("Invalid credentials!");
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }
}
