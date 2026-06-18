# BE Architecture — ecommerce (Core 5 feature + JWT/Spring Security)

> Tài liệu thiết kế để nhóm **code tay**. Skeleton folder/file đã được tạo sẵn (stub rỗng + `// TODO`).
> File này mô tả hợp đồng API + cách wire từng tầng + các bẫy runtime phải tránh.

## Convention (theo repo mẫu `ats_be`)
Feature-based. Mỗi feature `com.sba301.ecommerce.features.<x>/`:
- `controller/<X>Controller` — `@RestController @RequestMapping("/<x>") @RequiredArgsConstructor` (constructor injection, **không** `@Autowired` field), trả `ResponseEntity<DTO>`.
- `dto/` — request DTO (Lombok/record + jakarta validation) + response DTO (**phẳng, không trả entity**).
- `repository/<X>Repository` — `@Repository interface extends JpaRepository<E, Long>` + custom finder / `@Query` fetch-join.
- `service/<X>Service` (interface) + `service/<X>ServiceImpl` (`@Service @RequiredArgsConstructor @Transactional`, private mapper `toDto()/fromDto()`, throw custom exception).
- Custom exception ở package chung `com.sba301.ecommerce.exception`.

## ⚠️ 5 ràng buộc runtime PHẢI tuân (mvn compile KHÔNG bắt được — sai là 500 lúc chạy)
1. **`spring.jpa.open-in-view=false` + entity lazy 2 chiều → controller PHẢI trả DTO, KHÔNG trả entity.** Trả entity → `LazyInitializationException` / Jackson đệ quy vô hạn. Map entity→DTO **bên trong** service `@Transactional`; dùng fetch-join khi cần collection.
2. **Context-path đã là `/api`** (`server.servlet.context-path=/api`). Controller map `/auth`, `/products`, `/carts`... **KHÔNG thêm `/api`** (sẽ thành `/api/api`). Repo mẫu dùng `/api/v1/...` — **đừng copy**.
3. **CORS:** allow origin **`http://localhost:5173`** (FE Vite), KHÔNG phải `3000`. Dùng bean `CorsConfigurationSource` + `http.cors(...)`, KHÔNG dùng `@CrossOrigin` annotation (không phủ security filter → preflight OPTIONS bị 401).
4. **jjwt 0.12.x API:** build `Jwts.builder().subject().claim().issuedAt().expiration().signWith(key)`; parse `Jwts.parser().verifyWith(key).build().parseSignedClaims(t).getPayload()`. **Không có** `getBody()` / `parserBuilder()` (đó là 0.11) — viết nhầm là không compile.
5. **`app.jwt.secret` đang là placeholder** `CHANGE_ME_...` → base64-decode < 256-bit → `Keys.hmacShaKeyFor` ném `WeakKeyException` → `/auth/login` 500. **Đặt secret thật ≥32 byte base64** trước khi chạy: `openssl rand -base64 48`.
6. **Đừng copy bug của repo mẫu:** `DepartmentController.create()` validate xong trả "successful" mà **không gọi service** (stub); `PageRequest.of(index, size)` với `index` default `1` trong khi Spring page **0-based** → bỏ trang đầu. → Wire method đúng + dùng **paging 0-based**.

---

## Tầng cross-cutting

### `com.sba301.ecommerce.exception`
- `ResourceNotFoundException`, `BadRequestException`, `EmailAlreadyExistsException`, `InvalidCredentialsException` — `extends RuntimeException` (thêm constructor `(String message)`).
- `GlobalExceptionHandler` (`@RestControllerAdvice`): map
  - `ResourceNotFoundException` → 404
  - `BadRequestException` / `MethodArgumentNotValidException` → 400
  - `BadCredentialsException` / `InvalidCredentialsException` → 401
  - `AccessDeniedException` → 403
  - body `{ message, status }`. (Không có handler này → custom exception ra 500.)

### `com.sba301.ecommerce.security`
- **`JwtService`** — sign/parse JWT bằng `app.jwt.secret` + `app.jwt.expiration-ms`. Key: `Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret))`. Methods: `generateToken(email, role)`, `extractEmail(token)`, `isValid(token)`.
- **`CustomUserDetails implements UserDetails`** — bọc `User` entity. `getUsername()`=email, `getPassword()`=passwordHash, `getAuthorities()`=`List.of(new SimpleGrantedAuthority("ROLE_"+role.name()))`, `isEnabled()`=`isActive`. Expose `getUser()` để lấy id không cần query lại.
- **`CustomUserDetailsService implements UserDetailsService`** — `loadUserByUsername(email)` → `UserRepository.findByEmail(...).orElseThrow(UsernameNotFoundException)` → `CustomUserDetails`.
- **`JwtAuthenticationFilter extends OncePerRequestFilter`** — đọc header `Authorization: Bearer <token>`; nếu hợp lệ → load UserDetails → set `UsernamePasswordAuthenticationToken` vào `SecurityContext`. Token lỗi → bỏ qua (để entry point trả 401). Dùng import `jakarta.servlet.*`.
- **`SecurityConfig`** (`@Configuration @EnableWebSecurity @RequiredArgsConstructor`):
  - Beans: `BCryptPasswordEncoder`, `AuthenticationManager` (từ `AuthenticationConfiguration`), `CorsConfigurationSource` (origin 5173).
  - Filter chain: `.cors(withDefaults()).csrf(disable).sessionManagement(STATELESS).addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)`.
  - **Authorize matchers** (path SAU context-path, KHÔNG `/api`):
    - `permitAll`: `OPTIONS /**`, `/auth/**`, `GET /products`,`/products/**`,`/categories`,`/categories/**`, `/swagger-ui/**`,`/swagger-ui.html`,`/v3/api-docs/**`, `/actuator/health`,`/actuator/info`
    - `hasRole("CUSTOMER")`: `/carts/**`
    - `hasAnyRole("ADMIN","STAFF")`: POST/PUT/DELETE product+category, PUT order status
    - `anyRequest().authenticated()`
  - (Nên) `exceptionHandling` entry point trả 401 sạch thay vì redirect.
- **Lấy user hiện tại trong service:** `SecurityContextHolder.getContext().getAuthentication().getPrincipal()` → `CustomUserDetails` → `getUser().getId()` (không cần query thêm).

---

## Feature 1 — Auth/User (`features.auth`)
- **`repository/UserRepository`**: `Optional<User> findByEmail(String)`, `boolean existsByEmail(String)`.
- **DTO**:
  - `LoginRequest{ @Email @NotBlank email; @NotBlank password }`
  - `RegisterRequest{ @Email @NotBlank email; @NotBlank @Size(min=6) password; @NotBlank fullName; phone }` — **role ép `CUSTOMER` server-side**, không tin client.
  - `AuthResponse{ accessToken; tokenType="Bearer"; userId; email; fullName; role }` — **FE đọc `res.data.accessToken`** lưu localStorage.
- **`AuthService/Impl`**:
  - `register`: `existsByEmail` → nếu trùng `EmailAlreadyExistsException`; `passwordHash = encoder.encode(password)`; `role=CUSTOMER`; save; trả token.
  - `login`: `authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email,password))` (catch `BadCredentialsException`→`InvalidCredentialsException`); load user; trả token.
- **`AuthController`** `/auth`: `POST /auth/login` (200), `POST /auth/register` (201). → `/api/auth/...`.
- **`UserController`** `/users`: `GET /users/me` → profile user hiện tại.

## Feature 2 — Cart (`features.cart`) — QUAN TRỌNG NHẤT, FE đã gọi
FE `frontend/src/features/cart/components/Cart.jsx` (baseURL `http://localhost:8080/api`, Bearer token tự đính):
- `GET /carts/me` → `res.data.items[]`
- `PUT /carts/items/{id}` body `{ quantity }`
- `DELETE /carts/items/{id}`

- **`repository`**:
  - `CartRepository.findByUserId(Long)`; `findByUserIdWithItems` fetch-join `items→variant→product` (1 collection → không `MultipleBagFetchException`).
  - `CartItemRepository.findByIdWithVariant(Long)` fetch-join `variant→product`.
- **DTO khớp ĐÚNG shape FE**:
  - `CartItemResponse{ id; productName(=variant.product.name); variantInfo(=size+" / "+color); sku; unitPrice(=variant.price); quantity; discount(=BigDecimal.ZERO — domain chưa có); stockQuantity }`
  - `CartResponse{ id; List<CartItemResponse> items }`
  - `UpdateCartItemRequest{ @NotNull @Min(1) Integer quantity }`
- **`CartService/Impl`** (lấy user từ SecurityContext):
  - `getMyCart()` — **`@Transactional` read-write** (get-or-create → có INSERT cart mới; `readOnly=true` sẽ rollback). Newly created → `items` rỗng.
  - `updateItemQuantity(id, qty)` — fetch-join; **ownership check** (item.cart.user.id == current → không thì 404, không leak); **stock check** (`qty > variant.stockQuantity` → `BadRequestException`); set qty (dirty-check flush).
  - `removeItem(id)` — ownership check → delete.
- **`CartController`** `/carts`: GET `/carts/me`, PUT `/carts/items/{id}`, DELETE `/carts/items/{id}` (204). → khớp FE.

| FE field | Nguồn | Bridge |
|---|---|---|
| productName | variant.product.name | cần fetch-join product |
| variantInfo | — | `size + " / " + color` |
| discount | — | hardcode `ZERO` (TODO: chưa có domain) |

## Feature 3 — Product (`features.product`) — refactor cái có sẵn
Hiện `ProductController` dùng `@Autowired` field + trả `List<Map>` + không có service. Refactor:
- **DTO**: `ProductResponse{ id, name, slug, brand, basePrice, status, categoryName, List<ProductVariantResponse> variants, List<ProductImageResponse> images }`, `ProductVariantResponse{ id, sku, size, color, price, stockQuantity }`, `ProductImageResponse{ url, isPrimary }`, `ProductRequest` (create/update).
- **`ProductRepository`**: thêm `findBySlug`, fetch-join detail (variants+images+category).
- **`ProductService/Impl`**: `findAll(Pageable 0-based)`, `findById/findBySlug`, `create/update/delete` (xoá mềm: set `deletedAt`/status). GET permitAll; ghi `hasAnyRole(ADMIN,STAFF)`.
- **`ProductController`**: bỏ `@Autowired`+`List<Map>` → constructor injection + service + `ResponseEntity<Page<ProductResponse>>`. (FE chưa gọi `/products` — đang mock — nên đổi response không vỡ FE.)

## Feature 4 — Category (`features.category`)
- **`CategoryRepository`**: `findByParentIsNull()` (root), `findBySlug`.
- **DTO**: `CategoryResponse{ id, name, slug, displayOrder, isActive, parentId, List<CategoryResponse> children (1 cấp tránh đệ quy sâu) }`, `CategoryRequest`.
- **`CategoryService/Impl`**: `findAllTree`/`findAll`, `findById`, `create/update/delete`.
- **`CategoryController`** `/categories`: GET permitAll; ghi `hasAnyRole(ADMIN,STAFF)`.

## Feature 5 — Order (`features.order`)
- **`repository`**: `OrderRepository.findByUserId`, `findByOrderCode` (fetch-join items→variant); `OrderItemRepository`.
- **DTO**: `OrderResponse{ orderCode, status, paymentStatus, channel, subtotal, shippingFee, totalAmount, note, items[] }`, `OrderItemResponse{ productName, variantInfo, unitPrice, quantity, subtotal }`, `CreateOrderRequest{ shippingAddressId? (nullable — Address feature defer), note, items[](variantId, quantity) }`, `UpdateOrderStatusRequest{ status }`.
- **`OrderService/Impl`**: `createOrder` (build OrderItem từ request/cart, tính subtotal/total, gen `orderCode`, status=PENDING, paymentStatus=UNPAID — **không xử lý Payment**, feature defer), `listMyOrders`, `getByCode` (ownership), `updateStatus` (staff/admin).
- **`OrderController`** `/orders`: POST `/orders`, GET `/orders/me`, GET `/orders/{orderCode}`, PUT `/orders/{id}/status`.

---

## Thứ tự code đề xuất
1. `exception/` → 2. `UserRepository` → 3. `security/*` → 4. `features.auth` → 5. `features.cart` (test với FE) → 6. `product` → 7. `category` → 8. `order`.
9. Đặt `app.jwt.secret` thật + điền creds DB (`application.properties`) → `mvnw spring-boot:run`.

## Cách test (sau khi điền DB + secret)
1. `POST /api/auth/register` → tạo user CUSTOMER.
2. `POST /api/auth/login` → lấy `accessToken`.
3. `GET /api/carts/me` với header `Authorization: Bearer <token>` → cart rỗng (get-or-create).
4. Swagger UI: `http://localhost:8080/api/swagger-ui.html`.

## Giới hạn chủ ý (defer)
- Feature **Review, Payment, Address, AuditLog** chưa build (entity sẵn). Order: `shippingAddressId` nullable, không xử lý Payment. Cart: `discount` = 0 (chưa có domain).
