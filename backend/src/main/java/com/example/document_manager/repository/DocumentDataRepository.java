package com.example.document_manager.repository;

import com.example.document_manager.model.DocumentData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentDataRepository extends MongoRepository<DocumentData, String> {
}
