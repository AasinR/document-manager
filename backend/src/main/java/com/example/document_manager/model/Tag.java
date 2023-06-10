package com.example.document_manager.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@Document("tags")
public class Tag {
    @Id
    private String id;
    @Indexed
    private String name;
    @Indexed
    private String ownerId;

    public Tag(String name, String ownerId) {
        this.name = name;
        this.ownerId = ownerId;
    }
}
