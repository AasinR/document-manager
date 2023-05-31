package com.example.document_manager.repository;

import com.example.document_manager.model.DocumentData;
import com.example.document_manager.model.projection.DocumentIdProjection;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentDataRepository extends MongoRepository<DocumentData, String> {
    List<DocumentData> findAllByOwnerId(String ownerId);

    Optional<DocumentIdProjection> findIdByFileHash(String fileHash);
}
