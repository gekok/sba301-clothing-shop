# GIẢI THÍCH CHI TIẾT FILE CONFIG: VNPayConfig.java & MockDevelopmentAuthFilter.java & application.properties

- **Đường dẫn tương đối:** 
  - `backend/src/main/java/com/sba301/ecommerce/config/VNPayConfig.java`
  - `backend/src/main/java/com/sba301/ecommerce/config/MockDevelopmentAuthFilter.java`
  - `backend/src/main/resources/application.properties`

---

## 1. `VNPayConfig.java` (Cấu hình mã hóa VNPAY)
```java
@Component // Khai báo là 1 Spring Bean
public class VNPayConfig {
    @Value("${vnpay.tmn-code}")
    private String vnp_TmnCode; // Đọc mã website shop từ application.properties

    @Value("${vnpay.hash-secret}")
    private String vnp_HashSecret; // Đọc chuỗi bí mật dùng để băm băm checksum

    public String getPaymentUrl(String orderCode, String amountStr, String clientIp) {
        // 1. Gom các tham số vào Map (Version, Command, Amount, CurrCode, TxnRef, ReturnUrl...)
        // 2. Sắp xếp thứ tự các tham số theo Alphabet (A-Z)
        // 3. Nối các tham số thành chuỗi băm hashData
        // 4. Mã hóa chuỗi băm bằng thuật toán HmacSHA512 với vnp_HashSecret
        String vnp_SecureHash = hmacSHA512(vnp_HashSecret, hashData);
        return vnp_PayUrl + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;
    }
}
```

---

## 2. `MockDevelopmentAuthFilter.java` (Filter giả lập đăng nhập ngầm)
```java
@Component
public class MockDevelopmentAuthFilter extends OncePerRequestFilter {
    // Tự động chặn mọi HTTP Request gửi tới backend
    // Nếu SecurityContext chưa có User -> Tự động nạp User "customer@sba301.local" từ DB vào bộ nhớ
    // Giúp các bạn trong team thỏa sức code và test API Giỏ hàng/Checkout mà không bị chặn bởi lỗi 401 Unauthorized
}
```

---

## 3. `application.properties` (Cấu hình hệ thống)
```properties
# Kết nối SQL Server
spring.datasource.url=jdbc:sqlserver://localhost:1433; DatabaseName=sba301_ecommerce; encrypt=true; trustServerCertificate=true;
spring.datasource.username=sa
spring.datasource.password=123456

# DDL Auto (none: giữ nguyên bảng trong DB không tự drop table)
spring.jpa.hibernate.ddl-auto=none

# Cấu hình VNPAY Sandbox
vnpay.tmn-code=OWBZLJR8
vnpay.hash-secret=OOV71FUQL5VBFDON8N90WFPOEJK5OO0V
```
