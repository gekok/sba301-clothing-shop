# Tiến độ — Phần D: 3 UI (Admin Order + Staff POS + Audit Logs)

> File ghi trạng thái để tiếp tục đúng mạch khi quay lại. Cập nhật mới nhất: phiên đang code tay (anh gõ chay), Tầng 1 xong, Tầng 2 đang gõ.

## Bối cảnh & quyết định đã chốt

- **Người phụ trách:** phần D (Quản trị + POS bán tại shop + audit log).
- **Cách làm:** anh **gõ chay** (tự gõ tay để luyện). Em (Claude) **không tự Write/Edit file code** — chỉ đưa code trong câu trả lời + giải thích chi tiết từng dòng theo MENTOR mode. Em chỉ Read để check anh gõ đúng chưa khi anh yêu cầu.
- **Scope:** **3 UI riêng** (UI thứ 3 audit log nhỏ nên tách riêng thay vì nhúng):
  1. Admin Order Management — `/admin/orders`
  2. Staff POS — `/staff/pos`
  3. Audit Logs — `/admin/audit-logs`
- **Data:** **mock trong FE trước**, nối API sau. Mock bám đúng shape entity thật (đã làm phẳng quan hệ object).
- **Auth:** **bỏ qua** — không phân quyền, ai vào cũng xem (nối Security phần A sau).
- **Mock store:** **Cách 1 — mỗi page `useState` riêng** từ mock seed (KHÔNG dùng Context chung). Đổi status ở Admin không tự nhảy sang Audit Log — chấp nhận, vì nối BE thật sau này sẽ tự đồng bộ.

## Cấu trúc file (frontend/src/)

```
utils/format.js          ✅ Tầng 1 — formatVND, formatDateTime
utils/orderStatus.js     ✅ Tầng 1 — map nhãn/màu + ORDER_TRANSITIONS + getValidTransitions
mock/orders.js           🔶 Tầng 2 — 6 đơn (đủ 6 status + 2 channel)
mock/products.js         🔶 Tầng 2 — 3 sản phẩm, có 1 variant tồn=0 để test chặn
mock/auditLogs.js        🔶 Tầng 2 — 6 log, changes là chuỗi JSON
components/StatusBadge.jsx    ⬜ Tầng 3
App.jsx (sửa)                ⬜ Tầng 4 — thêm 3 route + link navbar
pages/admin/OrderManagement.jsx  ⬜ Tầng 5 — UI 1
pages/staff/POS.jsx (thay placeholder) ⬜ Tầng 6 — UI 2
pages/admin/AuditLogs.jsx        ⬜ Tầng 7 — UI 3
```

Chú thích: ✅ xong & đã check | 🔶 đã đưa code + anh đang gõ, CHƯA check | ⬜ chưa làm

## Trạng thái chi tiết

### Tầng 1 — utils ✅ (đã gõ + đã check)
- Anh đã gõ `format.js` + `orderStatus.js`.
- **Lỗi đã phát hiện & yêu cầu sửa:**
  - `orderStatus.js`: `'infor'` → sửa thành `'info'` (2 chỗ: `ORDER_STATUS_VARIANT.CONFIRMED` và `ORDER_TRANSITIONS.PENDING[0].variant`). **Cần verify lại anh đã sửa chưa.**
  - `format.js`: xoá dòng `import React from 'react';` (thừa, file JS thuần). **Cần verify.**
- **Khác biệt so với plan gốc cần NHỚ:**
  - Anh đổi tên hàm `getNextActions` → **`getValidTransitions`**. Tầng 5 phải dùng đúng tên này.
  - Anh để `CANCELLED: 'dark'`, `COMPLETED: 'danger'` (ngược trực giác). Em đã gợi ý đổi `COMPLETED:'dark'` + `CANCELLED:'danger'` nhưng KHÔNG bắt buộc — anh tự quyết. Lúc quay lại check xem anh giữ kiểu nào để Tầng 3/5 hiển thị nhất quán.

### Tầng 2 — mock data 🔶 (anh đang gõ, CHƯA check)
- Em đã đưa đủ code 3 file `mock/orders.js`, `mock/products.js`, `mock/auditLogs.js`.
- **Việc cần làm khi quay lại:** Read 3 file anh gõ, đối chiếu:
  - `orders.js`: 6 đơn, đủ status PENDING/CONFIRMED/SHIPPING/DELIVERED/COMPLETED/CANCELLED, channel ONLINE/IN_STORE. Đơn IN_STORE (#5) phải có `createdByStaffName` + `shippingAddress: null` + `shippingFee: 0`. Đơn UNPAID có `payments: []`.
  - `products.js`: variant id 11/12/21/31 phải khớp `variantId` trong orders.js. Có 1 variant `stockQuantity: 0` (id 13).
  - `auditLogs.js`: `changes` là **string JSON**, không phải object. `targetId` trỏ đúng đơn.

## Các tầng còn lại (chưa đưa code)

- **Tầng 3 — `components/StatusBadge.jsx`:** component nhận prop `status` + loại (order/payment), tra map màu+nhãn ở `orderStatus.js`, render `<Badge>`. Lần đầu đụng JSX + props.
- **Tầng 4 — `App.jsx`:** thêm route `/admin/orders`, `/admin/audit-logs`, giữ `/staff/pos`; thêm link navbar. Hiện App.jsx có sẵn route `/`, `/admin` (Dashboard), `/staff/pos`.
- **Tầng 5 — `OrderManagement.jsx` (UI 1):** bảng đơn + filter (status/channel/search) bằng useState + nút action render động từ `getValidTransitions(order.status)` + đổi status cập nhật state local + xem chi tiết items/payments. ĐÂY là UI trọng tâm, dạy kỹ pattern data-driven UI.
- **Tầng 6 — `POS.jsx` (UI 2):** 2 cột — trái danh sách variant (flatMap từ MOCK_PRODUCTS, search, chặn tồn=0), phải giỏ POS (qty +/-, xoá, tính tổng), chọn khách walk-in/nhập tên, nút Thanh toán tiền mặt → tạo đơn IN_STORE/COMPLETED/PAID → hiện hoá đơn.
- **Tầng 7 — `AuditLogs.jsx` (UI 3):** bảng log + filter action/targetType + `JSON.parse(changes)` hiện from→to.

## Thông tin kỹ thuật nền (đã đọc từ entity thật)

- `OrderStatus`: PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED, COMPLETED
- `OrderPaymentStatus`: UNPAID, PAID, REFUNDED
- `OrderChannel`: ONLINE, IN_STORE
- `PaymentMethod`: CASH, COD, BANK_TRANSFER, MOMO, VNPAY
- `PaymentTxnStatus`: PENDING, SUCCESS, FAILED, REFUNDED
- Backend phần D hiện CHƯA có controller/service/repository (chỉ entity + enum). FE mock hoàn toàn.

## Khi quay lại — checklist nối tiếp

1. Read `format.js` + `orderStatus.js` → xác nhận đã sửa `infor`→`info` + xoá `import React`.
2. Read 3 file `mock/*.js` → đối chiếu shape + id khớp.
3. Báo anh kết quả check Tầng 2. Nếu sạch → sang Tầng 3 (StatusBadge).
4. Tiếp tục đưa code + giải thích từng tầng, chờ anh gõ + nói "tiếp" mới sang tầng kế.
