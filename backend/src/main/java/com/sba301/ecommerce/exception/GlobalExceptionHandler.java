package com.sba301.ecommerce.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

// TODO: @ExceptionHandler cho:
//   ResourceNotFoundException -> 404
//   BadRequestException / MethodArgumentNotValidException -> 400
//   BadCredentialsException / InvalidCredentialsException -> 401
//   AccessDeniedException -> 403
// Trả body { message, status }. Không có handler này -> custom exception ra 500.
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException e) {
        ErrorResponse response = ErrorResponse.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .message(e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException e) {
        ErrorResponse response = ErrorResponse.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .message(e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(response);
    }

    // Phase 2a (Review update/delete) — xem ReviewAccessDeniedException.java để biết lý do tách
    // riêng khỏi ReviewNotEligibleException. Ownership mismatch KHÔNG dùng handler này (dùng
    // ResourceNotFoundException -> 404 ở trên).
    @ExceptionHandler(ReviewAccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleReviewAccessDenied(ReviewAccessDeniedException e) {
        ErrorResponse response = ErrorResponse.builder()
                .status(HttpStatus.FORBIDDEN.value())
                .message(e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(response);
    }

    // Phase 3b — org.springframework.security.access.AccessDeniedException là exception Spring
    // Security tự ném ra khi @PreAuthorize (vd trên AdminReviewController) đánh giá false — KHÁC
    // ReviewAccessDeniedException (exception nghiệp vụ tự định nghĩa ở trên, dùng cho update review).
    // Bắt buộc phải có handler riêng cho lớp này: nếu không, nó rơi xuống @ExceptionHandler(Exception)
    // bên dưới và trả 500 thay vì 403 — TODO ở đầu file đã ghi rõ "AccessDeniedException -> 403"
    // nhưng chưa ai hiện thực trước Phase 3b (không feature nào dùng @PreAuthorize trước đó).
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException e) {
        ErrorResponse response = ErrorResponse.builder()
                .status(HttpStatus.FORBIDDEN.value())
                .message("Bạn không có quyền thực hiện thao tác này.")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(response);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handBadRequest(BadRequestException e) {
        ErrorResponse response =ErrorResponse.builder()
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
        ErrorResponse response =ErrorResponse.builder()
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
}
