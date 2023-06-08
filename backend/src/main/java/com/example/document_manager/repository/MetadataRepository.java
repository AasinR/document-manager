package com.example.document_manager.repository;

import com.example.document_manager.model.Metadata;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MetadataRepository extends MongoRepository<Metadata, String> {
    List<Metadata> findAllByDocumentId(String documentId);

    Optional<Metadata> findFirstByDocumentIdOrderByTimestampAsc(String documentId);

    void deleteAllByDocumentId(String documentId);

    int countByDocumentId(String documentId);
}
