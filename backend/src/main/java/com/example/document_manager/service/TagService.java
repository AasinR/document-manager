package com.example.document_manager.service;

import com.example.document_manager.model.DocumentData;
import com.example.document_manager.model.SavedDocument;
import com.example.document_manager.model.Tag;
import com.example.document_manager.repository.DocumentDataRepository;
import com.example.document_manager.repository.SavedDocumentRepository;
import com.example.document_manager.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TagService {
    private final SavedDocumentRepository savedDocumentRepository;
    private final DocumentDataRepository documentDataRepository;
    private final TagRepository tagRepository;

    public List<Tag> getAllByOwner(String ownerId) {
        return tagRepository.findAllByOwnerId(ownerId);
    }

    public Optional<Tag> getById(String id) {
        return tagRepository.findById(id);
    }

    public Optional<Tag> add(String ownerId, String name) {
        if (tagRepository.existsByOwnerIdAndName(ownerId, name)) {
            return Optional.empty();
        }
        Tag tag = new Tag(name, ownerId);
        try {
            return Optional.of(tagRepository.insert(tag));
        }
        catch (DuplicateKeyException e) {
            return Optional.empty();
        }
    }

    public Optional<Tag> update(Tag tag) {
        if (tagRepository.existsByOwnerIdAndName(tag.getOwnerId(), tag.getName())) {
            return Optional.empty();
        }
        return Optional.of(tagRepository.save(tag));
    }

    public void delete(String id) {
        List<SavedDocument> savedDocumentList = savedDocumentRepository.findAllByTagListId(id);
        List<DocumentData> documentDataList = documentDataRepository.findAllByTagListId(id);
        savedDocumentList.forEach(document -> document.getTagList().removeIf(tag -> Objects.equals(tag.getId(), id)));
        documentDataList.forEach(document -> document.getTagList().removeIf(tag -> Objects.equals(tag.getId(), id)));
        savedDocumentRepository.saveAll(savedDocumentList);
        documentDataRepository.saveAll(documentDataList);
        tagRepository.deleteById(id);
    }
}
