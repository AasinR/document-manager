package com.example.document_manager.repository;

import com.example.document_manager.enums.Visibility;
import com.example.document_manager.model.DocumentData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentDataRepository extends MongoRepository<DocumentData, String> {
    List<DocumentData> findAllByVisibility(Visibility visibility);

    List<DocumentData> findAllByOwnerId(String ownerId);
}
