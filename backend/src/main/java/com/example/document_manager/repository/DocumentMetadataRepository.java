package com.example.document_manager.repository;

import com.example.document_manager.model.DocumentMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentMetadataRepository extends MongoRepository<DocumentMetadata, String> {
}
