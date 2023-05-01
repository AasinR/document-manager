package com.example.document_manager.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Set;

@Data
@NoArgsConstructor
@Document("groups")
public class Group {
    @Id
    private String id;
    private String name;
    private Set<GroupMember> groupMemberList;

    public Group(String name, Set<GroupMember> groupMemberList) {
        this.name = name;
        this.groupMemberList = groupMemberList;
    }
}
