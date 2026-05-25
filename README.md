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
5. Mở `backend/src/main/resources/application.properties` → điền `spring.datasource.username` + `spring.datasource.password` theo tài khoản vừa setup ở máy.

> ⚠️ **Tuyệt đối KHÔNG commit username/password thật lên git.** File `application.properties` trong repo chỉ chứa placeholder (`YOUR_DB_USERNAME`/`YOUR_DB_PASSWORD`). Mỗi dev tự điền local trên máy mình. Khi deploy production phải dùng env var (`${DB_USERNAME}`/`${DB_PASSWORD}`) hoặc secret manager + grant tối thiểu quyền cần thiết, không dùng `sa`.

**Bước 3** — tạo schema. Có 2 cách:

- **Cách A (dev nhanh)**: để Hibernate auto-generate. Trong `application.properties` set `spring.jpa.hibernate.ddl-auto=update`. Lần đầu chạy BE, Hibernate tự `CREATE TABLE` dựa trên entity.
- **Cách B (production)**: dùng file SQL hoặc Flyway/Liquibase migration. Generate DDL từ `docs/erd.dbml` (dbdiagram.io → Export to MSSQL), review tay, commit vào `backend/src/main/resources/db/migration/V1__init.sql`.

→ Nhóm bắt đầu nên dùng **Cách A**. Sau khi schema ổn (~2 tuần) chuyển sang Cách B để version-control schema.

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
# dev only — production dùng Flyway/Liquibase
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
│           ├── application.properties
│           ├── data.sql                        # Seed (optional)
│           └── db/migration/                   # Flyway (sau khi schema ổn)
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

| # | Người | Domain | Entity / module | API chính |
|---|---|---|---|---|
| 1 | A | Auth + User | User, Address | login, register, profile, address CRUD |
| 2 | B | Catalog | Category, Product, ProductVariant, ProductImage | product search/filter, admin CRUD catalog |
| 3 | C | Cart + Customer Order | Cart, CartItem, Order (online), Payment | add to cart, checkout, view order history |
| 4 | D | Admin + POS | Order (IN_STORE), AuditLog | admin dashboard, staff POS create order, order status update |
| 5 | E | Review + FE shared | Review + React shared components | review CRUD, layout, routing, AuthContext |

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
- Check tài khoản SQL Server đã enabled + đúng password (đã điền vào `application.properties` local), SQL Server đang ở mixed-mode authentication

**Lỗi "The driver could not establish a secure connection"**
- Thêm `;encrypt=true;trustServerCertificate=true` vào JDBC URL (đã có trong `application.properties` mẫu)

**FE gọi BE bị CORS**
- Backend cần `@CrossOrigin(origins = "http://localhost:5173")` trên controller hoặc cấu hình global CORS trong `SecurityConfig`

**Hibernate không tạo bảng**
- Check `spring.jpa.hibernate.ddl-auto=update` (không phải `none`)
- Check log `Hibernate:` có chạy `CREATE TABLE` không
- Lần đầu nên dùng DB mới hoàn toàn, không phải DB có bảng cũ
