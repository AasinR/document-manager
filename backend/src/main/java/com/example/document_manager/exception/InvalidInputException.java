package com.example.document_manager.exception;

import java.util.Arrays;

public class InvalidInputException extends RuntimeException {
    public InvalidInputException() {
        super("The given fields are required and cannot be empty!");
    }

    public InvalidInputException(boolean isRequired, String... values) {
        super("The given fields " + (isRequired ? "are required and " : "") + "cannot be empty: " + Arrays.toString(values));
    }
}
