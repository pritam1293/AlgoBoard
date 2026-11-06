package com.algoboard.exception;

/**
 * Raised when credentials are correct but the account email has not been
 * verified yet. A verification email is re-sent before this is returned to
 * the client.
 */
public class EmailNotVerifiedException extends RuntimeException {

    public EmailNotVerifiedException(String message) {
        super(message);
    }
}
