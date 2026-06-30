package com.sba301.ecommerce.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

// TODO: @ExceptionHandler cho:
//   ResourceNotFoundException -> 404
//   BadRequestException / MethodArgumentNotValidException -> 400
//   BadCredentialsException / InvalidCredentialsException -> 401
//   AccessDeniedException -> 403
// Trả body { message, status }. Không có handler này -> custom exception ra 500.
@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<ErrorResponse> handBadRequest(BadRequestException e) {
                ErrorResponse response = ErrorResponse.builder()
                                .status(HttpStatus.BAD_REQUEST.value())
                                .message(e.getMessage())
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(response);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleException(Exception e) {
                ErrorResponse response = ErrorResponse.builder()
                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                .message(e.getMessage())
                                .timestamp(LocalDateTime.now())
                                .build();

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(response);
        }

        // @Valid
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
                Map<String, String> errors = new HashMap<>();

                e.getBindingResult()
                                .getFieldErrors()
                                .forEach(error -> errors.put(
                                                error.getField(),
                                                error.getDefaultMessage()));

                ErrorResponse response = ErrorResponse.builder()
                                .status(HttpStatus.BAD_REQUEST.value())
                                .message("Validation Failed")
                                .timestamp(LocalDateTime.now())
                                .errors(errors)
                                .build();

                return ResponseEntity
                                .badRequest()
                                .body(response);
        }

        @ExceptionHandler(ReviewNotEligibleException.class)
        public ResponseEntity<Map<String, Object>> handleNotEligible(ReviewNotEligibleException ex) {
                return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage());
        }

        @ExceptionHandler(DuplicateReviewException.class)
        public ResponseEntity<Map<String, Object>> handleDuplicate(DuplicateReviewException ex) {
                return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
        }

        @ExceptionHandler(EntityNotFoundException.class)
        public ResponseEntity<Map<String, Object>> handleEntityNotFound(EntityNotFoundException ex) {
                return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
        }

        private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
                Map<String, Object> body = new LinkedHashMap<>();
                body.put("timestamp", LocalDateTime.now());
                body.put("status", status.value());
                body.put("error", status.getReasonPhrase());
                body.put("message", message);
                return ResponseEntity.status(status).body(body);
        }
}
