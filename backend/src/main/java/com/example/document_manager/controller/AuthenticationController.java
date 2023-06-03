package com.example.document_manager.controller;

import com.example.document_manager.exception.DataNotFoundException;
import com.example.document_manager.exception.InvalidInputException;
import com.example.document_manager.model.User;
import com.example.document_manager.model.request.AuthenticationRequest;
import com.example.document_manager.model.response.AuthenticationResponse;
import com.example.document_manager.security.LDAPAuthenticationProvider;
import com.example.document_manager.service.JwtService;
import com.example.document_manager.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/auth")
@AllArgsConstructor
public class AuthenticationController {
    private final LDAPAuthenticationProvider authenticationProvider;
    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        if (request.username() == null || request.username().isBlank() || request.password() == null || request.password().isBlank()) {
            throw new InvalidInputException(true, "username", "password");
        }
        User user = userService.getByUsername(request.username())
                .orElseThrow(() -> new DataNotFoundException("User", request.username()));

        authenticationProvider.authenticate(new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        String jwtToken = jwtService.generateToken(user);
        AuthenticationResponse response = new AuthenticationResponse(jwtToken);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
