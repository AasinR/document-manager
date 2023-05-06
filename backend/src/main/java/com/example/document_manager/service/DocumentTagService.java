package com.example.document_manager.service;

import com.example.document_manager.model.DocumentTag;
import com.example.document_manager.repository.DocumentTagRepository;
import lombok.AllArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class DocumentTagService {
    private final DocumentTagRepository documentTagRepository;

    public List<DocumentTag> getAll() {
        return documentTagRepository.findAll();
    }

    public List<DocumentTag> getAllByOwner(String ownerId) {
        return documentTagRepository.findAllByOwnerId(ownerId);
    }

    public Optional<DocumentTag> getById(String id) {
        return documentTagRepository.findById(id);
    }

    public Optional<DocumentTag> addTag(String ownerId, String name) {
        DocumentTag documentTag = new DocumentTag(name, ownerId);
        try {
            return Optional.of(documentTagRepository.insert(documentTag));
        }
        catch (DuplicateKeyException e) {
            return Optional.empty();
        }
    }

    public Optional<DocumentTag> updateTag(DocumentTag documentTag) {
        return Optional.of(documentTagRepository.save(documentTag));
    }

    public void deleteTag(String id) {
        documentTagRepository.deleteById(id);
    }
}
