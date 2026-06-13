package com.sba301.ecommerce.exception;

import org.springframework.web.bind.annotation.RestControllerAdvice;

// TODO: @ExceptionHandler cho:
//   ResourceNotFoundException -> 404
//   BadRequestException / MethodArgumentNotValidException -> 400
//   BadCredentialsException / InvalidCredentialsException -> 401
//   AccessDeniedException -> 403
// Trả body { message, status }. Không có handler này -> custom exception ra 500.
@RestControllerAdvice
public class GlobalExceptionHandler {
}
