package com.example.document_manager.service;

import com.example.document_manager.model.Tag;
import com.example.document_manager.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TagService {
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
        tagRepository.deleteById(id);
    }
}
