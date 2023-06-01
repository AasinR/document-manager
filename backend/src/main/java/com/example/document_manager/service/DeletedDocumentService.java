package com.example.document_manager.service;

import com.example.document_manager.model.DeletedDocument;
import com.example.document_manager.repository.DeletedDocumentRepository;
import lombok.AllArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class DeletedDocumentService {
    private final DeletedDocumentRepository deletedDocumentRepository;

    public List<DeletedDocument> getAll() {
        return deletedDocumentRepository.findAll();
    }

    public Optional<DeletedDocument> getById(String id) {
        return deletedDocumentRepository.findById(id);
    }

    public Optional<DeletedDocument> add(String documentId) {
        DeletedDocument deletedDocument = new DeletedDocument(documentId);
        try {
            return Optional.of(deletedDocumentRepository.insert(deletedDocument));
        }
        catch (DuplicateKeyException e) {
            return Optional.empty();
        }
    }

    public void delete(String id) {
        deletedDocumentRepository.deleteById(id);
    }
}
