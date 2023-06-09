package com.example.document_manager.repository;

import com.example.document_manager.model.SavedDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedDocumentRepository extends MongoRepository<SavedDocument, String> {
    List<SavedDocument> findAllByOwnerId(String ownerId);

    List<SavedDocument> findAllByDocumentId(String documentId);

    List<SavedDocument> findAllByOwnerIdIn(List<String> ownerIdList);

    List<SavedDocument> findAllByDocumentIdAndOwnerIdIn(String documentId, List<String> ownerIdList);

    Optional<SavedDocument> findByOwnerIdAndDocumentId(String ownerId, String documentId);

    boolean existsByOwnerIdAndDocumentId(String ownerId, String documentId);
}
