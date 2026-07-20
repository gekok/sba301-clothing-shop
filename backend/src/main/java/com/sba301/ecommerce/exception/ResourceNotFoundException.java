package com.sba301.ecommerce.exception;

// TODO: ném khi không tìm thấy resource (product/category/order/cart item...). Map -> HTTP 404 trong GlobalExceptionHandler.
//       Thêm constructor (String message) { super(message); }
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
