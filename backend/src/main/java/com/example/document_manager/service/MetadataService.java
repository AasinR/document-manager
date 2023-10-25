package com.example.document_manager.service;

import com.example.document_manager.model.DocumentData;
import com.example.document_manager.model.Metadata;
import com.example.document_manager.model.request.MetadataRequest;
import com.example.document_manager.repository.DocumentDataRepository;
import com.example.document_manager.repository.MetadataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MetadataService {
    private final MetadataRepository metadataRepository;
    private final DocumentDataRepository documentDataRepository;

    public List<Metadata> getAllByDocumentId(String documentId) {
        return metadataRepository.findAllByDocumentId(documentId);
    }

    public Optional<Metadata> getById(String id) {
        return metadataRepository.findById(id);
    }

    private DocumentData save(DocumentData documentData, String username) {
        if (metadataRepository.countByDocumentId(documentData.getId()) >= 5) {
            metadataRepository.findFirstByDocumentIdOrderByTimestampAsc(documentData.getId()).ifPresent(metadataRepository::delete);
        }
        Metadata metadata = documentData.getMetadata();
        metadata.setId(null);
        metadata.setUsername(username);
        metadata.setTimestamp(LocalDateTime.now());
        documentData.setMetadata(metadataRepository.insert(metadata));
        return documentDataRepository.save(documentData);
    }

    public Optional<DocumentData> add(DocumentData documentData, MetadataRequest data, String username) {
        Metadata metadata = documentData.getMetadata();
        metadata.setTitle(data.title());
        metadata.setAuthorList(Objects.requireNonNullElseGet(data.authorList(), ArrayList::new));
        metadata.setDescription(data.description());
        metadata.setPublicationDate(data.publicationDate());
        metadata.setIdentifierList(Objects.requireNonNullElseGet(data.identifierList(), HashMap::new));
        metadata.setOtherData(Objects.requireNonNullElseGet(data.otherData(), HashMap::new));
       try {
            return Optional.of(save(documentData, username));
        }
        catch (DuplicateKeyException e) {
            return Optional.empty();
        }
    }

    public Optional<DocumentData> addRelatedDocument(DocumentData documentData, String relatedDocumentId, String username) {
        boolean isPresent = documentData.getMetadata().getRelatedDocumentList().add(relatedDocumentId);
        if (isPresent) {
            return Optional.of(save(documentData, username));
        }
        return Optional.empty();
    }

    public void removeRelatedDocument(DocumentData documentData, String relatedDocumentId, String username) {
        boolean isRemoved = documentData.getMetadata().getRelatedDocumentList().remove(relatedDocumentId);
        if (isRemoved) {
            save(documentData, username);
        }
    }

    public void deleteAllByDocumentId(String documentId) {
        metadataRepository.deleteAllByDocumentId(documentId);
    }
}
