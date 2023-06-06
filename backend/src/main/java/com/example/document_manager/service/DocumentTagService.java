package com.example.document_manager.service;

import com.example.document_manager.model.DocumentTag;
import com.example.document_manager.repository.DocumentTagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DocumentTagService {
    private final DocumentTagRepository documentTagRepository;

    public List<DocumentTag> getAllByOwner(String ownerId) {
        return documentTagRepository.findAllByOwnerId(ownerId);
    }

    public Optional<DocumentTag> getById(String id) {
        return documentTagRepository.findById(id);
    }

    public Optional<DocumentTag> add(String ownerId, String name) {
        if (documentTagRepository.existsByOwnerIdAndName(ownerId, name)) {
            return Optional.empty();
        }
        DocumentTag documentTag = new DocumentTag(name, ownerId);
        try {
            return Optional.of(documentTagRepository.insert(documentTag));
        }
        catch (DuplicateKeyException e) {
            return Optional.empty();
        }
    }

    public Optional<DocumentTag> update(DocumentTag documentTag) {
        if (documentTagRepository.existsByOwnerIdAndName(documentTag.getOwnerId(), documentTag.getName())) {
            return Optional.empty();
        }
        return Optional.of(documentTagRepository.save(documentTag));
    }

    public void delete(String id) {
        documentTagRepository.deleteById(id);
    }
}
