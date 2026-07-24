package com.meridian.keystone.exception;

public class AccessDeniedSecurityException extends RuntimeException {
    public AccessDeniedSecurityException(String message) {
        super(message);
    }
}
