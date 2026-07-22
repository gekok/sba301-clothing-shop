# GIẢI THÍCH CHI TIẾT FILE SERVICE: CartServiceImpl.java

- **Đường dẫn tương đối:** `backend/src/main/java/com/sba301/ecommerce/features/cart/service/CartServiceImpl.java`
- **Chức năng:** Tầng nghiệp vụ xử lý logic thêm, bớt, sửa, xóa sản phẩm trong Giỏ hàng.

---

## GIẢI THÍCH CHI TIẾT TỪNG HÀM VÀ THUẬT TOÁN

### 1. `getCurrentUser()`
- Lấy thông tin xác thực hiện tại từ `SecurityContextHolder`.
- Ép kiểu về `CustomUserDetails` để trích xuất `userId`.
- Tìm User trong CSDL qua `userRepository.findById(userId)`. Nếu không thấy ➔ ném ngoại lệ `InvalidCredentialsException` (401).

### 2. `getMyCart()`
- Lấy giỏ hàng của user hiện tại bằng `cartRepository.findByUserIdWithItems(userId)`.
- Nếu User chưa từng có giỏ hàng ➔ Tự động khởi tạo `new Cart()`, gán `user` và lưu vào DB.
- Đóng gói dữ liệu sang `CartResponse` kèm danh sách mảng `items`.

### 3. `addItem(AddCartItemRequest request)`
- **Kiểm tra tồn kho khả dụng:** 
  ```java
  int availableStock = getAvailableStockForUser(variant, currentUser);
  ```
  Số lượng kho khả dụng = Số lượng tồn kho thực tế trong `ProductVariant` + Số lượng món đó chính User này đang giữ tạm ở trang Checkout (nếu có).
- **Cộng dồn số lượng:**
  - Nếu `ProductVariant` này đã tồn tại trong giỏ ➔ Tăng số lượng `cartItem.setQuantity(oldQty + newQty)`.
  - Kiểm tra xem `newQuantity` có lớn hơn `availableStock` không. Nếu lớn hơn ➔ Ném lỗi `BadRequestException("Số lượng trong giỏ hàng vượt quá số lượng kho khả dụng.")`.
  - Nếu chưa có ➔ Khởi tạo `CartItem` mới và lưu vào CSDL.

### 4. `updateItemQuantity(Long itemId, Integer quantity)`
- Kiểm tra `quantity > 0`. Nếu `<= 0` ➔ Gọi xóa `removeItem(itemId)`.
- Tìm `CartItem` trong DB. Kiểm tra quyền sở hữu (`item.getCart().getUser().getId().equals(currentUser.getId())`). Tránh việc User A sửa bậy giỏ hàng của User B.
- Cập nhật số lượng mới và lưu DB.

### 5. `removeItem(Long itemId)`
- Tìm `CartItem` theo ID. Xóa bản ghi khỏi danh sách `cart.getItems().remove(item)` và xóa khỏi DB qua `cartItemRepository.delete(item)`.
