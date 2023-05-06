package com.example.document_manager.repository;

import com.example.document_manager.model.DocumentTag;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentTagRepository extends MongoRepository<DocumentTag, String> {
}
