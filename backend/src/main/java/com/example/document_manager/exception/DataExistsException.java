package com.example.document_manager.exception;

public class DataExistsException extends RuntimeException {
    public DataExistsException(String name, String id) {
        super(String.format("%s with ID \"%s\" already exists!", name, id));
    }

    public DataExistsException(String message) {
        super(message);
    }
}
