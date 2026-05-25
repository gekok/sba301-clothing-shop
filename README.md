# SBA301 — Small Clothing E-commerce

Dự án luyện code tay cho nhóm 5 người — web bán quần áo nhỏ gồm 2 luồng chính:
1. **Khách hàng online**: đăng ký → duyệt sản phẩm → bỏ giỏ → đặt hàng → thanh toán → review
2. **Nhân viên / quản trị**: Admin CRUD catalog + duyệt đơn online; Staff tạo đơn POS tại shop

---

## 1. Tech stack

> Phiên bản dưới đây chọn **bản LTS ổn định, phổ biến trong tài liệu / kỳ thi SBA301** — KHÔNG dùng bản cutting-edge mới nhất để tránh lệch với đề thi.

### Frontend
| Thành phần | Phiên bản | Mục đích |
|---|---|---|
| React | **18.3.x** *(stable, nhiều tutorial nhất)* | UI library |
| Vite | **5.4.x** *(stable LTS-style)* | Build tool + dev server |
| React Router | **6.26.x** *(v6 — phổ biến trong giáo trình)* | Client-side routing (SPA) |
| Axios | **1.7.x** | HTTP client gọi BE |
| React-Bootstrap | 2.x | UI component |
| Bootstrap | 5.3.x | CSS framework đi kèm React-Bootstrap |
| ESLint | 8.x | Lint |
| Prettier | 3.x | Format |

### Backend
| Thành phần | Phiên bản | Mục đích |
|---|---|---|
| Java | **21 (LTS)** *(release T9/2023, phổ biến nhất hiện nay)* | Ngôn ngữ |
| Spring Boot | **3.4.x** *(stable trong nhánh 3.x)* | Framework |
| Spring Framework | 6.2.x *(đi kèm Spring Boot 3.4)* | Core |
| Spring Web | 6.2.x | REST API |
| Spring Data JPA | 3.4.x | ORM với Hibernate 6 |
| Spring Security | 6.4.x | Auth + role-based access |
| JJWT | 0.12.x | JWT token |
| Lombok | 1.18.34+ *(hỗ trợ JDK 21)* | Giảm boilerplate |
| Bean Validation | Jakarta Validation 3.0.x | Validate request DTO |
| Springdoc OpenAPI | 2.6.x *(starter-webmvc-ui)* | Swagger UI tự động |
| MapStruct (optional) | 1.6.0 | Entity ↔ DTO mapping |

> ✅ **Spring Boot 3.4 + Java 21 LTS** là combo phổ biến nhất trong giáo trình SBA301 hiện tại. Đa số tutorial trên YouTube / Baeldung / Spring Guide đều dùng bộ này.

### Database & Tools
| Thành phần | Phiên bản | Mục đích |
|---|---|---|
| SQL Server | **2019** (Developer / Express) hoặc 2022 | Database chính |
| SQL Server Management Studio (SSMS) | **20.x** | Quản lý DB |
| Maven | **3.9.x** | Build BE |
| Node.js | **20 LTS** *(20.19.x — active LTS lâu nhất hiện tại)* | Chạy FE |
| Git | 2.40+ | Source control |
| Postman | latest | Test API |

### Lý do chọn các bản này (cho kỳ thi)

- **Java 21 LTS** — phổ biến nhất 2024-2026, đa số đề thi + tài liệu FPT đang dùng. Có pattern matching, virtual threads, record patterns đầy đủ. Java 25 mới ra T9/2025 còn ít tài liệu.
- **Spring Boot 3.4.x** — nhánh 3.x đã ổn định 2 năm. Spring Boot 4.0 mới ra T11/2025, nhiều thư viện thứ 3 chưa support hoàn toàn → tránh trong môi trường thi.
- **React 18.3 + Vite 5 + React Router 6** — đây là combo được giảng dạy trong slides SBA301 (xem `Slides/` của lớp). React 19 + Vite 8 + RR7 đổi API khá nhiều, đề thi chưa cập nhật.
- **SQL Server 2019** — phổ biến nhất ở các phòng lab FPT, ổn định với Hibernate dialect `SQLServerDialect`. SQL Server 2025 mới ra T11/2025, một số tính năng mới (vector type) chưa cần.
- **Node.js 20 LTS** — vẫn được support đến T4/2026 (Maintenance). Vite 5 chạy mượt trên Node 20. Node 24 mới active LTS T5/2026.

---

## 2. Yêu cầu hệ thống (Prerequisites)

Trước khi cài, máy phải có:

- **JDK 21 LTS** — `java -version` phải trả `21.x.x` (vd `21.0.5`)
- **Maven 3.9.x** hoặc dùng `mvnw` đi kèm — `mvn -version`
- **Node.js 20 LTS + npm 10+** — `node -v` trả `v20.x.x`, `npm -v` trả `10.x.x`
- **SQL Server 2019** (Developer / Express edition đều OK) — đã chạy service `MSSQLSERVER`, port `1433`
- **SSMS 20.x** — quản lý DB qua GUI
- **Git 2.40+** — `git --version`
- **IDE**: IntelliJ IDEA 2024.3+ (BE) + VS Code latest (FE) khuyến nghị

---

## 3. Cài đặt (Setup)

### 3.1. Clone source

```bash
git clone <repo-url> sba301
cd sba301/ecommerce
```

### 3.2. Cài database (SQL Server)

**Bước 1** — mở SSMS, tạo database mới:

```sql
CREATE DATABASE sba301_ecommerce
COLLATE Vietnamese_CI_AS;
GO
```

Lý do collation `Vietnamese_CI_AS`: hỗ trợ tiếng Việt có dấu, case-insensitive (so sánh "Áo" = "áo").

**Bước 2** — bật SQL Server Authentication (mixed-mode) để app kết nối bằng username/password.

1. SSMS → chuột phải server name → **Properties** → tab **Security** → chọn **SQL Server and Windows Authentication mode** → OK.
2. Trong **Security → Logins** → chuột phải `sa` (hoặc tài khoản dev mình muốn dùng) → **Properties** → đặt password của riêng mình.
3. Tab **Status** → Login = **Enabled** → OK.
4. Restart service `MSSQLSERVER` (services.msc).
5. Mở `backend/src/main/resources/application.properties` → sửa `spring.datasource.username` + `spring.datasource.password` theo tài khoản SQL Server của máy mình (vd `sa` / `1234`). Không commit thay đổi creds lên repo.

**Bước 3** — tạo schema. Mở `docs/db.sql` trong SSMS rồi F5 — file này tạo đủ 14 bảng + seed sẵn 4 user mẫu, 2 danh mục, 2 sản phẩm với 6 variant để test.

Sau khi chạy `db.sql` xong, set `spring.jpa.hibernate.ddl-auto=validate` trong `application.properties` để Hibernate chỉ kiểm tra schema khớp entity, không sửa.

(Nếu chỉ muốn thử nhanh, để nguyên `ddl-auto=update` thì Hibernate sẽ tự tạo bảng từ entity — bỏ qua `db.sql`. Nhưng không có sẵn seed data.)

### 3.3. Cài backend

```bash
cd backend
```

**Tạo skeleton** (nếu chưa có `pom.xml`): vào https://start.spring.io/ chọn:
- Project: **Maven**
- Language: **Java**
- Spring Boot: **3.4.x** *(stable nhánh 3.x)*
- Group: `com.sba301`
- Artifact: `ecommerce`
- Java: **21**
- Dependencies: Spring Web, Spring Data JPA, Spring Security, Lombok, Validation, SQL Server Driver, Spring Boot DevTools

Bấm **Generate**, giải nén, copy thư mục `src/main/java/com/sba301/ecommerce/entity/` hiện tại vào.

**Cấu hình `src/main/resources/application.properties`**:

```properties
spring.application.name=sba301-ecommerce

# ===== DataSource (SQL Server) =====
# Mỗi dev điền username/password local của máy mình — KHÔNG commit creds thật.
spring.datasource.url=jdbc:sqlserver://localhost:1433; DatabaseName=sba301_ecommerce; encrypt=true; trustServerCertificate=true;
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver

# ===== JPA / Hibernate =====
# update: tự tạo/sửa bảng theo entity. Đổi 'validate' nếu đã chạy docs/db.sql tay.
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.SQLServerDialect
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.show-sql=true

# ===== Server =====
server.port=8080
server.servlet.context-path=/api

# ===== Custom app config =====
app.jwt.secret=<random-256-bit-base64-string>
app.jwt.expiration-ms=86400000
```

**Chạy BE**:

```bash
./mvnw spring-boot:run
# Windows
mvnw.cmd spring-boot:run
```

Server lên ở http://localhost:8080/api. Swagger UI: http://localhost:8080/api/swagger-ui.html

### 3.4. Cài frontend

```bash
cd ../frontend     # nếu nhóm chưa có thư mục này, tạo bằng:
# npm create vite@latest frontend -- --template react
cd frontend
npm install
```

**Cấu hình `.env`** (file `frontend/.env`):

```
VITE_API_BASE_URL=http://localhost:8080/api
```

**Chạy FE**:

```bash
npm run dev
```

App lên ở http://localhost:5173

---

## 4. Cách sử dụng (Usage)

### 4.1. Seed dữ liệu mẫu

Lần đầu chạy BE, schema rỗng. Có 2 cách seed:

- **Tự động**: tạo file `backend/src/main/resources/data.sql` (Spring Boot tự chạy sau khi Hibernate tạo schema). Seed 3 user mẫu (1 admin, 1 staff, 1 customer + 1 walk-in), vài category + product.
- **Tay**: chạy SQL trong SSMS sau khi BE start lần đầu.

Tài khoản mẫu đề xuất:

| Role | Email | Password |
|---|---|---|
| ADMIN | `admin@sba301.local` | `Admin@123` |
| STAFF | `staff@sba301.local` | `Staff@123` |
| CUSTOMER | `customer@sba301.local` | `Customer@123` |
| WALK-IN | `walkin@sba301.local` | *(no password — staff tạo đơn POS dùng user này)* |

### 4.2. Login flow

1. FE gọi `POST /api/auth/login` với `{email, password}`
2. BE trả về `{accessToken, role}`
3. FE lưu token vào `localStorage`, kèm theo header `Authorization: Bearer <token>` cho mọi request
4. FE redirect theo role:
   - `ADMIN` → `/admin/dashboard`
   - `STAFF` → `/staff/pos`
   - `CUSTOMER` → `/`

### 4.3. Test API qua Swagger / Postman

- Swagger: http://localhost:8080/api/swagger-ui.html — login lấy token → bấm **Authorize** dán `Bearer <token>` → test các endpoint
- Postman: import collection (sẽ commit ở `docs/postman/sba301.postman_collection.json`)

### 4.4. Workflow chính

**Customer online**:
```
POST /api/auth/register
POST /api/auth/login
GET  /api/products?categoryId=1&size=M
POST /api/cart/items                 (add to cart)
POST /api/orders/checkout            (tạo order từ cart hiện tại)
POST /api/payments                   (chọn method, trả tiền)
GET  /api/orders/me                  (xem đơn của mình)
POST /api/reviews                    (review sau khi DELIVERED)
```

**Admin**:
```
POST /api/admin/categories
POST /api/admin/products
POST /api/admin/products/{id}/variants
PUT  /api/admin/orders/{id}/status   (confirm / ship / cancel)
GET  /api/admin/audit-logs
```

**Staff (POS tại shop)**:
```
POST /api/staff/orders/pos           (tạo order kèm items, channel=IN_STORE)
PUT  /api/staff/orders/{id}/deliver  (đánh dấu giao hàng)
```

---

## 5. Cấu trúc thư mục

```
ecommerce/
├── README.md
├── docs/
│   ├── erd.dbml                       # paste vào https://dbdiagram.io/d
│   └── postman/                       # API collection (tạo sau)
├── backend/
│   ├── pom.xml                        # Maven build
│   ├── mvnw, mvnw.cmd                 # Maven wrapper
│   └── src/main/
│       ├── java/com/sba301/ecommerce/
│       │   ├── EcommerceApplication.java       # @SpringBootApplication entry point
│       │   ├── config/                         # SecurityConfig, OpenApiConfig, CorsConfig
│       │   ├── security/                       # JwtAuthenticationFilter, JwtTokenProvider, CustomUserDetailsService
│       │   ├── entity/                         # JPA entities (đã có)
│       │   │   ├── BaseEntity.java
│       │   │   ├── User.java, Address.java
│       │   │   ├── Category.java, Product.java, ProductVariant.java, ProductImage.java
│       │   │   ├── Cart.java, CartItem.java
│       │   │   ├── Order.java, OrderItem.java, Payment.java
│       │   │   ├── Review.java, AuditLog.java
│       │   │   └── enums/                      # Role, ProductStatus, OrderChannel, ...
│       │   ├── repository/                     # *Repository extends JpaRepository<Entity, Long>
│       │   ├── service/                        # Interface XxxService
│       │   │   └── impl/                       # XxxServiceImpl @Service
│       │   ├── controller/                     # REST endpoints @RestController
│       │   ├── dto/
│       │   │   ├── request/                    # Request DTO (record + Bean Validation)
│       │   │   └── response/                   # Response DTO (record)
│       │   ├── mapper/                         # MapStruct @Mapper(componentModel = "spring")
│       │   └── exception/                      # Custom exceptions + @RestControllerAdvice
│       └── resources/
│           └── application.properties          # Config chính (sửa creds DB theo máy mình, đừng commit creds)
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── .env
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/                       # axios instances + endpoint wrappers
        ├── pages/
        │   ├── customer/              # Home, ProductDetail, Cart, Checkout, OrderHistory
        │   ├── admin/                 # Dashboard, ProductMgmt, OrderMgmt
        │   └── staff/                 # POS
        ├── components/                # Shared UI (Button, Modal, ...)
        ├── hooks/                     # Custom hooks (useAuth, useCart)
        ├── context/                   # AuthContext, CartContext
        └── utils/                     # Helpers (format currency, date)
```

---

## 6. Schema design notes (đọc trước khi code)

| Điểm | Lý do |
|---|---|
| `order_items` có **snapshot** `product_name`, `variant_info`, `unit_price` | Đơn cũ phải bất biến (immutable) kể cả khi product bị xoá / đổi giá |
| `orders.status` tách riêng `payment_status` | Đơn POS = COMPLETED + PAID ngay. Đơn COD online = SHIPPING + UNPAID. Tách 2 trục để xử lý đúng cả 2 luồng |
| `orders.channel` + `created_by_staff_id` | Phân biệt đơn online tự checkout vs đơn POS staff tạo |
| `ProductVariant.version` (`@Version`) | Optimistic locking — chống double-spend tồn kho khi 2 customer checkout cùng variant |
| `users.email` + `password_hash` **nullable** | Walk-in customer không cần đăng ký. **Lưu ý**: SQL Server unique chỉ cho phép 1 NULL → nhóm dùng **1 user `walkin@sba301.local` chung** thay vì mỗi walk-in 1 row |
| `reviews.order_item_id` FK | Chỉ cho review sản phẩm đã mua thật. Unique `(user_id, order_item_id)` → 1 user chỉ review 1 lần / 1 item |
| `audit_logs` | Append-only — track mọi hành động của admin/staff phục vụ điều tra sau này |

---

## 7. Chia việc (5 người)

| # | Người | Phần phụ trách | Việc cần làm chính |
|---|---|---|---|
| 1 | A | Tài khoản, địa chỉ & **phân quyền** | Đăng ký, đăng nhập (sinh JWT), xem/sửa thông tin cá nhân, quản lý sổ địa chỉ. **Phụ trách luôn Spring Security**: cài JWT filter, cấu hình ai (ADMIN / STAFF / CUSTOMER) được gọi API nào, viết sẵn helper `@PreAuthorize("hasRole('ADMIN')")`… cho 4 người còn lại dùng |
| 2 | B | Sản phẩm & danh mục | Hiển thị danh mục, danh sách sản phẩm, chi tiết sản phẩm (size + màu), trang admin thêm/sửa/xoá sản phẩm |
| 3 | C | Giỏ hàng & đặt hàng online | Thêm vào giỏ, cập nhật số lượng, đặt hàng, chọn cách thanh toán, xem lịch sử đơn của mình |
| 4 | D | Quản trị & bán tại shop | Trang admin duyệt đơn, đổi trạng thái đơn (giao / huỷ), nhân viên tạo đơn tại cửa hàng (POS), ghi lại lịch sử thao tác của admin |
| 5 | E | Đánh giá & layout chung | Người mua xong viết đánh giá sản phẩm, làm phần giao diện chung (thanh menu, footer, routing, lưu trạng thái đăng nhập) |

> **Quy ước phân quyền chung** (cả 5 người phải nắm):
> - Mỗi API trên controller phải ghi rõ vai trò được gọi bằng `@PreAuthorize` — vd `hasRole('ADMIN')`, `hasAnyRole('ADMIN','STAFF')`, `hasRole('CUSTOMER')`, hoặc `permitAll()` cho endpoint public (đăng ký, login, xem sản phẩm).
> - Người 1 viết sẵn `SecurityConfig` + JWT filter — 4 người còn lại chỉ cần annotate controller, không cần đụng vào security infra.
> - Khi quên không annotate, default chặn hết (deny by default) → endpoint mới sẽ trả 403 cho tới khi được khai báo rõ vai trò.

---

## 8. Convention

### Git branch
```
main                                # production-ready
develop                             # tích hợp các feature
feature/<scope>-<short-desc>        # vd: feature/cart-add-item, feature/admin-product-crud
fix/<scope>-<short-desc>
```

### Commit message (Conventional Commits)
```
feat(cart): add cart item with quantity merge
fix(auth): handle expired jwt
refactor(product): extract variant query to repository
docs(readme): add setup steps for SQL Server
```

### Code style
- Java: Google Java Format hoặc IntelliJ default. Lombok cho getter/setter.
- React: Prettier + ESLint config có sẵn. Functional component + hooks (không class).
- Naming: entity = singular (`Order`), table = plural (`orders`).

### Pull request
- 1 PR = 1 feature/fix. Không gộp nhiều feature.
- PR cần ≥ 1 review approve mới merge.
- Mô tả PR phải có: **Mô tả**, **Test plan**, **Screenshot** (nếu UI).

---

## 9. Troubleshooting

**BE không kết nối DB**
- Check service `MSSQLSERVER` đang chạy: `services.msc`
- Check port: `netstat -ano | findstr 1433`
- Bật TCP/IP trong SQL Server Configuration Manager → SQL Server Network Configuration → Protocols for MSSQLSERVER → TCP/IP = **Enabled** → restart service
- Check tài khoản SQL Server đã enabled + đúng password (đã điền vào `application.properties`), SQL Server đang ở mixed-mode authentication

**Lỗi "The driver could not establish a secure connection"**
- Thêm `;encrypt=true;trustServerCertificate=true` vào JDBC URL (đã có trong `application.properties` mẫu)

**FE gọi BE bị CORS**
- Backend cần `@CrossOrigin(origins = "http://localhost:5173")` trên controller hoặc cấu hình global CORS trong `SecurityConfig`

**Hibernate không tạo bảng**
- Check `spring.jpa.hibernate.ddl-auto=update` (không phải `none`)
- Check log `Hibernate:` có chạy `CREATE TABLE` không
- Lần đầu nên dùng DB mới hoàn toàn, không phải DB có bảng cũ
