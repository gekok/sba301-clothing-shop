package com.sba301.ecommerce.exception;

// TODO: ném khi input sai nghiệp vụ (vd quantity > stock). Map -> HTTP 400.
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
