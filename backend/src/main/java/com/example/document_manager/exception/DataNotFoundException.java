package com.example.document_manager.exception;

public class DataNotFoundException extends RuntimeException {
    public DataNotFoundException(String name, String id) {
        super(String.format("%s with ID \"%s\" does not exist!", name, id));
    }
}
