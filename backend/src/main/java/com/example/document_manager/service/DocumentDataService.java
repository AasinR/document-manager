package com.example.document_manager.service;

import com.example.document_manager.enums.Visibility;
import com.example.document_manager.model.DocumentData;
import com.example.document_manager.repository.DocumentDataRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class DocumentDataService {
    private final DocumentDataRepository documentDataRepository;

    public List<DocumentData> getAllPublic() {
        return documentDataRepository.findAllByVisibility(Visibility.PUBLIC);
    }

    public List<DocumentData> getAllByOwner(String ownerId) {
        return documentDataRepository.findAllByOwnerId(ownerId);
    }

    public Optional<DocumentData> getById(String id) {
        return documentDataRepository.findById(id);
    }

    public void delete(String id) {
        documentDataRepository.deleteById(id);
    }
}
