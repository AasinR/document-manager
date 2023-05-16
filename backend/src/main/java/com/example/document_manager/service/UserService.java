package com.example.document_manager.service;

import com.example.document_manager.model.User;
import com.example.document_manager.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public Optional<User> getByUsername(String username) {
        return userRepository.findById(username);
    }

    public Optional<User> addUser(String username) {
        User user = new User(username);
        try {
            return Optional.of(userRepository.insert(user));
        }
        catch (DuplicateKeyException e) {
            return Optional.empty();
        }
    }

    public Optional<User> updateUser(User user) {
        return Optional.of(userRepository.save(user));
    }

    public void deleteUser(String username) {
        userRepository.deleteById(username);
    }
}
