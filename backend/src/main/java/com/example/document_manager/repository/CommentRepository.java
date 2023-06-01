package com.example.document_manager.repository;

import com.example.document_manager.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findAllByDocumentIdAndOwnerId(String documentId, String ownerId);

    void deleteAllByDocumentId(String documentId);
}
