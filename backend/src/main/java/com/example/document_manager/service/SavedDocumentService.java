package com.example.document_manager.service;

import com.example.document_manager.model.*;
import com.example.document_manager.model.projection.SavedDocumentDocumentIdProjection;
import com.example.document_manager.model.request.MetadataRequest;
import com.example.document_manager.repository.DeletedDocumentRepository;
import com.example.document_manager.repository.DocumentDataRepository;
import com.example.document_manager.repository.MetadataRepository;
import com.example.document_manager.repository.SavedDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class SavedDocumentService {
    private final DeletedDocumentRepository deletedDocumentRepository;
    private final SavedDocumentRepository savedDocumentRepository;
    private final DocumentDataRepository documentDataRepository;
    private final MetadataRepository metadataRepository;

    public List<SavedDocument> getAllByOwner(String ownerId) {
        return savedDocumentRepository.findAllByOwnerId(ownerId);
    }

    public List<SavedDocument> getAllByOwnerIdList(List<String> ownerIdList) {
        return savedDocumentRepository.findAllByOwnerIdIn(ownerIdList);
    }

    public List<SavedDocument> getAllByDocumentIdAndOwnerIdList(String documentId, List<String> ownerIdList) {
        return savedDocumentRepository.findAllByDocumentIdAndOwnerIdIn(documentId, ownerIdList);
    }

    public Optional<SavedDocument> getById(String id) {
        return savedDocumentRepository.findById(id);
    }

    public Optional<SavedDocument> getByOwnerIdAndDocumentId(String ownerId, String documentId) {
        return savedDocumentRepository.findByOwnerIdAndDocumentId(ownerId, documentId);
    }

    public Optional<SavedDocument> add(String ownerId, MetadataRequest data, String fileId, byte[] fileHash) {
        // save incomplete document data
        DocumentData documentData = new DocumentData(
                fileId,
                fileHash,
                null
        );
        DocumentData savedDocumentData = documentDataRepository.insert(documentData);

        // save metadata
        Metadata metadata = new Metadata(
                null,
                savedDocumentData.getId(),
                data.title(),
                data.authorList(),
                data.description(),
                data.publicationDate(),
                data.identifierList(),
                data.otherData()
        );
        Metadata savedMetadata = metadataRepository.insert(metadata);

        // save metadata reference
        savedDocumentData.setMetadata(savedMetadata);
        documentDataRepository.save(savedDocumentData);

        SavedDocument savedDocument = new SavedDocument(ownerId, savedDocumentData.getId());
        return Optional.of(savedDocumentRepository.insert(savedDocument));
    }

    public Optional<SavedDocument> save(String ownerId, String documentId) {
        SavedDocument savedDocument = new SavedDocument(ownerId, documentId);
        if (!savedDocumentRepository.existsByOwnerIdAndDocumentId(ownerId, documentId)) {
            deletedDocumentRepository.deleteByDocumentId(documentId);
            return Optional.of(savedDocumentRepository.insert(savedDocument));
        }
        return Optional.empty();
    }

    public Optional<SavedDocument> addTag(SavedDocument savedDocument, Tag tag) {
        boolean isPresent = savedDocument.getTagList().add(tag);
        if (isPresent) {
            return Optional.of(savedDocumentRepository.save(savedDocument));
        }
        return Optional.empty();
    }

    public void removeTag(SavedDocument savedDocument, String tagId) {
        boolean isRemoved = savedDocument.getTagList().removeIf(tag -> Objects.equals(tag.getId(), tagId));
        if (isRemoved) {
            savedDocumentRepository.save(savedDocument);
        }
    }

    public void delete(SavedDocument savedDocument) {
        savedDocumentRepository.deleteById(savedDocument.getId());
        if (!savedDocumentRepository.existsByDocumentId(savedDocument.getDocumentId())) {
            try {
                deletedDocumentRepository.insert(new DeletedDocument(savedDocument.getDocumentId()));
            }
            catch (DuplicateKeyException e) {
                // ignore
            }
        }
    }

    public void deleteAllByOwner(String ownerId) {
        List<String> savedDocumentIdList = savedDocumentRepository.findAllDocumentIdByOwnerId(ownerId)
                .stream()
                .map(SavedDocumentDocumentIdProjection::documentId)
                .toList();
        savedDocumentRepository.deleteAllByOwnerId(ownerId);
        List<String> filterDocumentIdList = savedDocumentRepository.findAllDocumentIdByDocumentIdIn(savedDocumentIdList)
                .stream()
                .map(SavedDocumentDocumentIdProjection::documentId)
                .toList();
        List<DeletedDocument> deletedDocumentList = savedDocumentIdList.stream()
                .filter(value -> !filterDocumentIdList.contains(value))
                .map(DeletedDocument::new)
                .toList();
        if (!deletedDocumentList.isEmpty()) {
            deletedDocumentRepository.insert(deletedDocumentList);
        }
    }

    public void migrate(String oldDocumentId, String newDocumentId) {
        List<SavedDocument> targetDocumentList = savedDocumentRepository.findAllByDocumentId(oldDocumentId);
        Set<String> filterSet = new HashSet<>();
        for (SavedDocument savedDocument : savedDocumentRepository.findAllByDocumentId(newDocumentId)) {
            filterSet.add(savedDocument.getOwnerId());
        }
        List<SavedDocument> upateDocumentList = new ArrayList<>();
        List<String> deleteDocumentList = new ArrayList<>();
        for (SavedDocument savedDocument : targetDocumentList) {
            if(filterSet.contains(savedDocument.getOwnerId())) {
                deleteDocumentList.add(savedDocument.getId());
            }
            else {
                savedDocument.setDocumentId(newDocumentId);
                upateDocumentList.add(savedDocument);
            }
        }
        savedDocumentRepository.deleteAllById(deleteDocumentList);
        savedDocumentRepository.saveAll(upateDocumentList);
    }
}
