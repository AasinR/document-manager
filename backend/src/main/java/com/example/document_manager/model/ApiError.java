package com.example.document_manager.model;

import java.time.ZonedDateTime;

public record ApiError(
        String path,
        String message,
        int statusCode,
        ZonedDateTime timestamp
) {
}
