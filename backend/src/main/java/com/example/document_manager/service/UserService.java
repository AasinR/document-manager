package com.example.document_manager.service;

import com.example.document_manager.enums.UserPermission;
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

    public Optional<User> add(String username) {
        User user = new User(username);
        try {
            return Optional.of(userRepository.insert(user));
        }
        catch (DuplicateKeyException e) {
            return Optional.empty();
        }
    }

    public Optional<User> update(User user) {
        return Optional.of(userRepository.save(user));
    }

    public Optional<User> promote(User user) {
        user.setPermission(UserPermission.ADMIN);
        return Optional.of(userRepository.save(user));
    }

    public void delete(String username) {
        userRepository.deleteById(username);
    }

    public boolean doesNotExist(String username) {
        return !userRepository.existsById(username);
    }
}
