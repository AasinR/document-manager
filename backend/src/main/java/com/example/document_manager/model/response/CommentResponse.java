package com.example.document_manager.model.response;

import java.time.LocalDateTime;

public record CommentResponse(
        String id,
        String ownerId,
        String documentId,
        UserData user,
        String content,
        LocalDateTime timestamp
) {
}
