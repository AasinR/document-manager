package com.example.document_manager.service;

import com.example.document_manager.model.DocumentData;
import com.example.document_manager.model.Tag;
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

    public List<DocumentData> getAll(List<String> idList) {
        return documentDataRepository.findAllById(idList);
    }

    public Optional<DocumentData> addTag(DocumentData documentData, Tag tag) {
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

    public boolean doesNotExist(String id) {
        return !documentDataRepository.existsById(id);
    }
}
