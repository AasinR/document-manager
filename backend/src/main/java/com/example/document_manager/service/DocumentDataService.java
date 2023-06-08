package com.example.document_manager.service;

import com.example.document_manager.model.DocumentData;
import com.example.document_manager.model.DocumentTag;
import com.example.document_manager.repository.DocumentDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DocumentDataService {
    private final DocumentDataRepository documentDataRepository;

    public List<DocumentData> getAll() {
        return documentDataRepository.findAll();
    }

    public Optional<DocumentData> getById(String id) {
        return documentDataRepository.findById(id);
    }

    public Optional<DocumentData> addTag(DocumentData documentData, DocumentTag tag) {
        boolean isPresent = documentData.getTagList().add(tag);
        if (isPresent) {
            return Optional.of(documentDataRepository.save(documentData));
        }
        return Optional.empty();
    }

    public void removeTag(DocumentData documentData, String tagId) {
        boolean isRemoved = documentData.getTagList().removeIf(tag -> Objects.equals(tag.getId(), tagId));
        if (isRemoved) {
            documentDataRepository.save(documentData);
        }
    }

    public void delete(String id) {
        documentDataRepository.deleteById(id);
    }
}
