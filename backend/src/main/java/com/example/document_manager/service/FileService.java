package com.example.document_manager.service;

import com.example.document_manager.model.projection.DocumentIdProjection;
import com.example.document_manager.repository.DocumentDataRepository;
import com.mongodb.client.gridfs.model.GridFSFile;
import lombok.AllArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Optional;

@Service
@AllArgsConstructor
public class FileService {
    private final GridFsTemplate gridFsTemplate;
    private final DocumentDataRepository documentDataRepository;

    public Optional<GridFsResource> getById(String fileId) {
        GridFSFile file = gridFsTemplate.findOne(Query.query(Criteria.where("_id").is(fileId)));
        if (file != null) {
            return Optional.of(gridFsTemplate.getResource(file));
        }
        return Optional.empty();
    }

    public Optional<String> save(MultipartFile file) {
        try {
            InputStream inputStream = file.getInputStream();
            String fileName = file.getOriginalFilename();
            String contentType = file.getContentType();

            ObjectId fileId = gridFsTemplate.store(inputStream, fileName, contentType);
            return Optional.of(fileId.toString());
        }
        catch (IOException e) {
            return Optional.empty();
        }
    }

    public void delete(String fileId) {
        gridFsTemplate.delete(Query.query(Criteria.where("_id").is(fileId)));
    }

    public Optional<String> exists(byte[] fileHash) {
        Optional<DocumentIdProjection> documentIdProjection = documentDataRepository.findIdByFileHash(fileHash);
        return documentIdProjection.map(DocumentIdProjection::id);
    }

    public Optional<byte[]> calculateSHA256(MultipartFile file) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(file.getBytes());
            return Optional.of(hashBytes);
        }
        catch (NoSuchAlgorithmException | IOException e) {
            return Optional.empty();
        }
    }
}
