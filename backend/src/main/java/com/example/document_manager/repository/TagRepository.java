package com.example.document_manager.repository;

import com.example.document_manager.model.Tag;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TagRepository extends MongoRepository<Tag, String> {
    List<Tag> findAllByOwnerId(String ownerId);

    void deleteAllByOwnerId(String ownerId);

    boolean existsByOwnerIdAndName(String ownerId, String name);
}
