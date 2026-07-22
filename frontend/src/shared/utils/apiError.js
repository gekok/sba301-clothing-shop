// Lấy câu thông báo lỗi từ response của backend.
// Tách ra vì cả 3 màn admin (đơn hàng, POS, nhật ký) đều cần đúng cách đọc này.
//
// GlobalExceptionHandler.java trả body dạng { status, message, timestamp }.
// Dấu ?. để không văng thêm lỗi khi mất mạng / backend chưa bật (lúc đó không có response).
export function readApiError(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage;
}
