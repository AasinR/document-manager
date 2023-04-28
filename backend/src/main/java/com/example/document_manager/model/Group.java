package com.example.document_manager.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document("groups")
public class Group {
    @Id
    String id;
    String name;
    List<GroupMember> groupMemberList;
}
