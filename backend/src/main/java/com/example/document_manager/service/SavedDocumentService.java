package com.example.document_manager.service;

import com.example.document_manager.model.DocumentData;
import com.example.document_manager.model.DocumentMetadata;
import com.example.document_manager.model.SavedDocument;
import com.example.document_manager.model.request.CreateDocumentRequest;
import com.example.document_manager.repository.DocumentDataRepository;
import com.example.document_manager.repository.DocumentMetadataRepository;
import com.example.document_manager.repository.SavedDocumentRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class SavedDocumentService {
    private final SavedDocumentRepository savedDocumentRepository;
    private final DocumentDataRepository documentDataRepository;
    private final DocumentMetadataRepository metadataRepository;

    public List<SavedDocument> getAllByOwner(String ownerId) {
        return savedDocumentRepository.findAllByOwnerId(ownerId);
    }

    public Optional<SavedDocument> getById(String id) {
        return savedDocumentRepository.findById(id);
    }

    public Optional<SavedDocument> add(String ownerId, CreateDocumentRequest data, String fileId, String fileHash) {
        // save incomplete document data
        DocumentData documentData = new DocumentData(
                fileId,
                fileHash,
                ownerId,
                null
        );
        DocumentData savedDocumentData = documentDataRepository.insert(documentData);

        // save metadata
        DocumentMetadata metadata = new DocumentMetadata(
                null,
                savedDocumentData.getId(),
                data.title(),
                data.authorList(),
                data.description(),
                data.publicationDate(),
                data.identifierList(),
                data.otherData()
        );
        DocumentMetadata savedMetadata = metadataRepository.insert(metadata);

        // save metadata reference
        savedDocumentData.setMetadata(savedMetadata);
        documentDataRepository.save(savedDocumentData);

        SavedDocument savedDocument = new SavedDocument(ownerId, savedDocumentData.getId());
        return Optional.of(savedDocumentRepository.insert(savedDocument));
    }

    public Optional<SavedDocument> save(String ownerId, String documentId) {
        SavedDocument savedDocument = new SavedDocument(ownerId, documentId);
        if (!savedDocumentRepository.existsByOwnerIdAndDocumentId(ownerId, documentId)) {
            return Optional.of(savedDocumentRepository.insert(savedDocument));
        }
        return Optional.empty();
    }

    public Optional<SavedDocument> addTag(SavedDocument savedDocument, String tagId) {
        boolean isPresent = savedDocument.getTagList().add(tagId);
        if (isPresent) {
            return Optional.of(savedDocumentRepository.save(savedDocument));
        }
        return Optional.empty();
    }

    public void removeTag(SavedDocument savedDocument, String tagId) {
        boolean isRemoved = savedDocument.getTagList().remove(tagId);
        if (isRemoved) {
            savedDocumentRepository.save(savedDocument);
        }
    }

    public void delete(String id) {
        savedDocumentRepository.deleteById(id);
    }
}
