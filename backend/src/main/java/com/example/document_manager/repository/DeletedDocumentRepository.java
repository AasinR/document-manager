package com.example.document_manager.repository;

import com.example.document_manager.model.DeletedDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeletedDocumentRepository extends MongoRepository<DeletedDocument, String> {
    void deleteByDocumentId(String documentId);
}
