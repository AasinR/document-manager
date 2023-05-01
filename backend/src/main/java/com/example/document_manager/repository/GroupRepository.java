package com.example.document_manager.repository;

import com.example.document_manager.model.Group;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends MongoRepository<Group, String> {
    List<Group> findAllByGroupMemberListUsername(String username);
}
