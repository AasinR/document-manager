package com.example.document_manager.service;

import com.example.document_manager.model.DocumentMetadata;
import com.example.document_manager.repository.DocumentMetadataRepository;
import lombok.AllArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class DocumentMetadataService {
    private final DocumentMetadataRepository metadataRepository;

    public List<DocumentMetadata> getAllByDocumentId(String documentId) {
        return metadataRepository.findAllByDocumentId(documentId);
    }

    public Optional<DocumentMetadata> getById(String id) {
        return metadataRepository.findById(id);
    }

    public Optional<DocumentMetadata> addMetadata(DocumentMetadata metadata) {
        try {
            return Optional.of(metadataRepository.insert(metadata));
        }
        catch (DuplicateKeyException e) {
            return Optional.empty();
        }
    }

    public void deleteMetadata(String id) {
        metadataRepository.deleteById(id);
    }

    public void deleteAllByDocumentId(String documentId) {
        metadataRepository.deleteAllByDocumentId(documentId);
    }
}
