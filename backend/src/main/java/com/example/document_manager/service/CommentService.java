package com.example.document_manager.service;

import com.example.document_manager.model.Comment;
import com.example.document_manager.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;

    public List<Comment> getAllByOwnerId(String documentId, String ownerId) {
        return commentRepository.findAllByDocumentIdAndOwnerId(documentId, ownerId);
    }

    public Optional<Comment> getById(String id) {
        return commentRepository.findById(id);
    }

    public Optional<Comment> add(String documentId, String ownerId, String username, String content) {
        Comment comment = new Comment(ownerId, documentId, username, content);
        return Optional.of(commentRepository.insert(comment));
    }

    public Optional<Comment> update(Comment comment) {
        return Optional.of(commentRepository.save(comment));
    }

    public void delete(String id) {
        commentRepository.deleteById(id);
    }

    public void deleteAllByDocumentId(String documentId) {
        commentRepository.deleteAllByDocumentId(documentId);
    }
}
