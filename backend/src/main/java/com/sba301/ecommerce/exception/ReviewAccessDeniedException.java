package com.sba301.ecommerce.exception;

// Quyết định (Phase 2a, xem PLAN_..._SPLIT.md mục "Phase 2a"): tách riêng exception này thay vì
// tái dùng ReviewNotEligibleException, vì 2 lớp nghĩa khác nhau:
//   - ReviewNotEligibleException: KHÔNG đủ điều kiện NGHIỆP VỤ để review (chưa mua, đơn chưa
//     DELIVERED/COMPLETED...) — dùng ở createReview, không liên quan quyền sở hữu.
//   - ReviewAccessDeniedException: request NHẬN DIỆN đúng review, nhưng bị chặn vì lý do quyền/
//     trạng thái khi sửa/xoá (đã sửa quá 1 lần, đã quá 24h kể từ createdAt...). Map -> HTTP 403
//     trong GlobalExceptionHandler.
// Riêng trường hợp "không phải chủ review" KHÔNG dùng exception này — theo đúng Phase 2b của
// PLAN_..._SPLIT.md, ownership mismatch trả 404 (tái dùng ResourceNotFoundException) để không lộ
// việc review đó tồn tại nhưng thuộc về người khác.
public class ReviewAccessDeniedException extends RuntimeException {
    public ReviewAccessDeniedException(String message) {
        super(message);
    }
}
