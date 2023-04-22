package com.example.document_manager.service;

import com.example.document_manager.model.User;
import com.example.document_manager.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public boolean addUser(String username) {
        User user = new User(username);
        userRepository.insert(user);
        return true;
    }
}
