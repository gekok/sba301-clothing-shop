# GIẢI THÍCH CHI TIẾT CÁC FILE ENUM (TẬP HỢP HẰNG SỐ TRẠNG THÁI)

Các file Enum quy định danh sách cố định các hằng số trạng thái trong hệ thống, đảm bảo không bị gõ sai chính tả hay sai logic.

---

## 1. `OrderStatus.java`
- *Đường dẫn:* `backend/src/main/java/com/sba301/ecommerce/features/entities/enums/OrderStatus.java`
- *Danh sách trạng thái:*
  - `DRAFT`: Đơn nháp.
  - `PENDING`: Đơn mới tạo thành công, đang chờ cửa hàng duyệt/xử lý.
  - `CONFIRMED`: Đã xác nhận đơn (hoặc đã thanh toán qua VNPAY thành công).
  - `SHIPPING`: Đã bàn giao cho đơn vị vận chuyển đang giao hàng.
  - `DELIVERED` / `COMPLETED`: Khách đã nhận hàng thành công, hoàn tất đơn.
  - `CANCELLED`: Đơn bị hủy (do khách hủy thanh toán VNPAY hoặc shop hủy).

---

## 2. `OrderPaymentStatus.java`
- *Đường dẫn:* `backend/src/main/java/com/sba301/ecommerce/features/entities/enums/OrderPaymentStatus.java`
- *Danh sách trạng thái:*
  - `UNPAID`: Chưa thanh toán (Thanh toán COD hoặc giao dịch VNPAY bị hủy).
  - `PAID`: Đã thanh toán tiền thành công (VNPAY trả về mã 00 hoặc thu tiền COD).

---

## 3. `OrderChannel.java`
- *Đường dẫn:* `backend/src/main/java/com/sba301/ecommerce/features/entities/enums/OrderChannel.java`
- *Danh sách kênh:*
  - `ONLINE`: Khách tự đặt hàng qua trang web Thương mại điện tử.
  - `POS`: Nhân viên bán hàng tại quầy thu ngân của cửa hàng.

---

## 4. `PaymentMethod.java` & `PaymentTxnStatus.java`
- *Đường dẫn:* `backend/src/main/java/com/sba301/ecommerce/features/entities/enums/PaymentMethod.java`
- *Phương thức:* `COD` (Thanh toán khi nhận hàng), `VNPAY` (Thanh toán trực tuyến qua VNPAY Sandbox).
- *Trạng thái giao dịch (`PaymentTxnStatus`):* `PENDING` (Đang chờ), `SUCCESS` (Thành công), `FAILED` (Thất bại).
