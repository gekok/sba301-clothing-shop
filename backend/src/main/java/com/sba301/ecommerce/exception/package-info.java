/**
 * Custom exceptions + global error handling.
 *
 * <p>Contains domain exceptions (e.g. {@code ResourceNotFoundException},
 * {@code OutOfStockException}) and a single {@code GlobalExceptionHandler}
 * annotated with {@code @RestControllerAdvice} that converts them to JSON
 * error responses.
 */
package com.sba301.ecommerce.exception;
