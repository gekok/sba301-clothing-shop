/* ============================================================================
   SBA301 — Small Clothing E-commerce
   File: docs/db.sql
   Mục đích: tạo schema thủ công cho SQL Server (2019/2022) thay vì để
             Hibernate auto-generate. Chạy trong SSMS sau khi đã tạo database.

   Cách dùng:
     1) Trong SSMS, tạo database trước:
          CREATE DATABASE sba301_ecommerce COLLATE Vietnamese_CI_AS;
          GO
     2) USE sba301_ecommerce, rồi mở file này và F5.
     3) Khi BE chạy, đổi spring.jpa.hibernate.ddl-auto=validate (hoặc none)
        để Hibernate không sửa schema này nữa.
============================================================================ */

USE sba301_ecommerce;
GO

/* ============================================================================
   1. DROP TABLES (theo thứ tự ngược FK — tránh lỗi ràng buộc)
============================================================================ */
IF OBJECT_ID('dbo.audit_logs', 'U')      IS NOT NULL DROP TABLE dbo.audit_logs;
IF OBJECT_ID('dbo.reviews', 'U')         IS NOT NULL DROP TABLE dbo.reviews;
IF OBJECT_ID('dbo.payments', 'U')        IS NOT NULL DROP TABLE dbo.payments;
IF OBJECT_ID('dbo.order_items', 'U')     IS NOT NULL DROP TABLE dbo.order_items;
IF OBJECT_ID('dbo.orders', 'U')          IS NOT NULL DROP TABLE dbo.orders;
IF OBJECT_ID('dbo.cart_items', 'U')      IS NOT NULL DROP TABLE dbo.cart_items;
IF OBJECT_ID('dbo.carts', 'U')           IS NOT NULL DROP TABLE dbo.carts;
IF OBJECT_ID('dbo.product_images', 'U')  IS NOT NULL DROP TABLE dbo.product_images;
IF OBJECT_ID('dbo.product_variants', 'U')IS NOT NULL DROP TABLE dbo.product_variants;
IF OBJECT_ID('dbo.products', 'U')        IS NOT NULL DROP TABLE dbo.products;
IF OBJECT_ID('dbo.categories', 'U')      IS NOT NULL DROP TABLE dbo.categories;
IF OBJECT_ID('dbo.addresses', 'U')       IS NOT NULL DROP TABLE dbo.addresses;
IF OBJECT_ID('dbo.users', 'U')           IS NOT NULL DROP TABLE dbo.users;
GO

/* ============================================================================
   2. USERS — khách + nhân viên + admin chung 1 bảng, phân biệt qua cột role
============================================================================ */
CREATE TABLE dbo.users (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    email           NVARCHAR(190)   NULL,   -- nullable cho khách vãng lai (walk-in)
    password_hash   NVARCHAR(255)   NULL,
    full_name       NVARCHAR(150)   NOT NULL,
    phone           NVARCHAR(20)    NULL,
    role            NVARCHAR(20)    NOT NULL CONSTRAINT df_users_role DEFAULT 'CUSTOMER',
    is_active       BIT             NOT NULL CONSTRAINT df_users_active DEFAULT 1,
    created_at      DATETIME2       NOT NULL CONSTRAINT df_users_created DEFAULT SYSUTCDATETIME(),
    updated_at      DATETIME2       NOT NULL CONSTRAINT df_users_updated DEFAULT SYSUTCDATETIME(),
    deleted_at      DATETIME2       NULL,
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT ck_users_role  CHECK (role IN ('ADMIN','STAFF','CUSTOMER'))
);
CREATE INDEX ix_users_role  ON dbo.users(role);
CREATE INDEX ix_users_phone ON dbo.users(phone);
GO

/* ============================================================================
   3. ADDRESSES — sổ địa chỉ giao hàng của mỗi user
============================================================================ */
CREATE TABLE dbo.addresses (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    recipient_name  NVARCHAR(150)   NOT NULL,
    phone           NVARCHAR(20)    NOT NULL,
    province        NVARCHAR(100)   NOT NULL,
    district        NVARCHAR(100)   NOT NULL,
    ward            NVARCHAR(100)   NULL,
    street          NVARCHAR(255)   NOT NULL,
    is_default      BIT             NOT NULL CONSTRAINT df_addr_default DEFAULT 0,
    created_at      DATETIME2       NOT NULL CONSTRAINT df_addr_created DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES dbo.users(id)
);
GO

/* ============================================================================
   4. CATEGORIES — cây danh mục (parent_id tự tham chiếu)
============================================================================ */
CREATE TABLE dbo.categories (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    parent_id       BIGINT          NULL,
    name            NVARCHAR(150)   NOT NULL,
    slug            NVARCHAR(180)   NOT NULL,
    display_order   INT             NOT NULL CONSTRAINT df_cat_order DEFAULT 0,
    is_active       BIT             NOT NULL CONSTRAINT df_cat_active DEFAULT 1,
    CONSTRAINT uk_categories_slug UNIQUE (slug),
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES dbo.categories(id)
);
GO

/* ============================================================================
   5. PRODUCTS — thông tin chung của sản phẩm, giá theo variant
============================================================================ */
CREATE TABLE dbo.products (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    category_id     BIGINT          NOT NULL,
    name            NVARCHAR(255)   NOT NULL,
    slug            NVARCHAR(280)   NOT NULL,
    description     NVARCHAR(4000)  NULL,
    brand           NVARCHAR(100)   NULL,
    base_price      DECIMAL(18,2)   NOT NULL,
    status          NVARCHAR(20)    NOT NULL CONSTRAINT df_prod_status DEFAULT 'DRAFT',
    created_at      DATETIME2       NOT NULL CONSTRAINT df_prod_created DEFAULT SYSUTCDATETIME(),
    updated_at      DATETIME2       NOT NULL CONSTRAINT df_prod_updated DEFAULT SYSUTCDATETIME(),
    deleted_at      DATETIME2       NULL,
    CONSTRAINT uk_products_slug   UNIQUE (slug),
    CONSTRAINT ck_products_status CHECK (status IN ('DRAFT','ACTIVE','HIDDEN')),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES dbo.categories(id)
);
CREATE INDEX ix_products_category ON dbo.products(category_id);
CREATE INDEX ix_products_status   ON dbo.products(status);
GO

/* ============================================================================
   6. PRODUCT_VARIANTS — mỗi biến thể size + màu là 1 SKU riêng, có tồn kho riêng
============================================================================ */
CREATE TABLE dbo.product_variants (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    product_id      BIGINT          NOT NULL,
    sku             NVARCHAR(64)    NOT NULL,
    size            NVARCHAR(20)    NOT NULL,
    color           NVARCHAR(50)    NOT NULL,
    price           DECIMAL(18,2)   NOT NULL,
    stock_quantity  INT             NOT NULL CONSTRAINT df_var_stock DEFAULT 0,
    is_active       BIT             NOT NULL CONSTRAINT df_var_active DEFAULT 1,
    version         BIGINT          NOT NULL CONSTRAINT df_var_version DEFAULT 0,  -- @Version cho optimistic locking
    CONSTRAINT uk_variants_sku                UNIQUE (sku),
    CONSTRAINT uk_variants_product_size_color UNIQUE (product_id, size, color),
    CONSTRAINT fk_variants_product            FOREIGN KEY (product_id) REFERENCES dbo.products(id)
);
GO

/* ============================================================================
   7. PRODUCT_IMAGES
============================================================================ */
CREATE TABLE dbo.product_images (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    product_id      BIGINT          NOT NULL,
    url             NVARCHAR(500)   NOT NULL,
    display_order   INT             NOT NULL CONSTRAINT df_img_order DEFAULT 0,
    is_primary      BIT             NOT NULL CONSTRAINT df_img_primary DEFAULT 0,
    CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES dbo.products(id)
);
GO

/* ============================================================================
   8. CARTS — mỗi customer 1 giỏ active
============================================================================ */
CREATE TABLE dbo.carts (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    created_at      DATETIME2       NOT NULL CONSTRAINT df_cart_created DEFAULT SYSUTCDATETIME(),
    updated_at      DATETIME2       NOT NULL CONSTRAINT df_cart_updated DEFAULT SYSUTCDATETIME(),
    CONSTRAINT uk_carts_user UNIQUE (user_id),
    CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES dbo.users(id)
);
GO

/* ============================================================================
   9. CART_ITEMS — 1 giỏ + 1 variant chỉ có 1 row (add lần 2 thì cộng dồn quantity)
============================================================================ */
CREATE TABLE dbo.cart_items (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    cart_id         BIGINT          NOT NULL,
    variant_id      BIGINT          NOT NULL,
    quantity        INT             NOT NULL,
    added_at        DATETIME2       NOT NULL CONSTRAINT df_citem_added DEFAULT SYSUTCDATETIME(),
    CONSTRAINT uk_cart_items_cart_variant UNIQUE (cart_id, variant_id),
    CONSTRAINT fk_cart_items_cart    FOREIGN KEY (cart_id)    REFERENCES dbo.carts(id),
    CONSTRAINT fk_cart_items_variant FOREIGN KEY (variant_id) REFERENCES dbo.product_variants(id)
);
GO

/* ============================================================================
   10. ORDERS — cả đơn online (channel=ONLINE) lẫn đơn POS (channel=IN_STORE)
============================================================================ */
CREATE TABLE dbo.orders (
    id                   BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_code           NVARCHAR(30)    NOT NULL,
    user_id              BIGINT          NOT NULL,
    channel              NVARCHAR(20)    NOT NULL,
    created_by_staff_id  BIGINT          NULL,
    shipping_address_id  BIGINT          NULL,
    subtotal             DECIMAL(18,2)   NOT NULL,
    shipping_fee         DECIMAL(18,2)   NOT NULL CONSTRAINT df_ord_ship DEFAULT 0,
    total_amount         DECIMAL(18,2)   NOT NULL,
    status               NVARCHAR(20)    NOT NULL CONSTRAINT df_ord_status   DEFAULT 'PENDING',
    payment_status       NVARCHAR(20)    NOT NULL CONSTRAINT df_ord_paystat DEFAULT 'UNPAID',
    note                 NVARCHAR(500)   NULL,
    created_at           DATETIME2       NOT NULL CONSTRAINT df_ord_created DEFAULT SYSUTCDATETIME(),
    updated_at           DATETIME2       NOT NULL CONSTRAINT df_ord_updated DEFAULT SYSUTCDATETIME(),
    CONSTRAINT uk_orders_code        UNIQUE (order_code),
    CONSTRAINT ck_orders_channel     CHECK (channel IN ('ONLINE','IN_STORE')),
    CONSTRAINT ck_orders_status      CHECK (status  IN ('PENDING','CONFIRMED','SHIPPING','DELIVERED','CANCELLED','COMPLETED')),
    CONSTRAINT ck_orders_payment     CHECK (payment_status IN ('UNPAID','PAID','REFUNDED')),
    CONSTRAINT fk_orders_user        FOREIGN KEY (user_id)             REFERENCES dbo.users(id),
    CONSTRAINT fk_orders_staff       FOREIGN KEY (created_by_staff_id) REFERENCES dbo.users(id),
    CONSTRAINT fk_orders_address     FOREIGN KEY (shipping_address_id) REFERENCES dbo.addresses(id)
);
CREATE INDEX ix_orders_user       ON dbo.orders(user_id);
CREATE INDEX ix_orders_status     ON dbo.orders(status);
CREATE INDEX ix_orders_channel    ON dbo.orders(channel);
CREATE INDEX ix_orders_created_at ON dbo.orders(created_at);
GO

/* ============================================================================
   11. ORDER_ITEMS — snapshot tên/giá/size+màu lúc đặt (đơn cũ bất biến)
============================================================================ */
CREATE TABLE dbo.order_items (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id        BIGINT          NOT NULL,
    variant_id      BIGINT          NOT NULL,
    product_name    NVARCHAR(255)   NOT NULL,  -- snapshot
    variant_info    NVARCHAR(100)   NOT NULL,  -- snapshot, vd "Size M / Đỏ"
    unit_price      DECIMAL(18,2)   NOT NULL,  -- snapshot
    quantity        INT             NOT NULL,
    subtotal        DECIMAL(18,2)   NOT NULL,
    CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)   REFERENCES dbo.orders(id),
    CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES dbo.product_variants(id)
);
GO

/* ============================================================================
   12. PAYMENTS — 1 đơn có thể có nhiều lần payment (vd refund 1 phần)
============================================================================ */
CREATE TABLE dbo.payments (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id        BIGINT          NOT NULL,
    method          NVARCHAR(20)    NOT NULL,
    amount          DECIMAL(18,2)   NOT NULL,
    transaction_ref NVARCHAR(100)   NULL,
    status          NVARCHAR(20)    NOT NULL CONSTRAINT df_pay_status DEFAULT 'PENDING',
    paid_at         DATETIME2       NULL,
    created_at      DATETIME2       NOT NULL CONSTRAINT df_pay_created DEFAULT SYSUTCDATETIME(),
    CONSTRAINT ck_payments_method   CHECK (method IN ('CASH','COD','BANK_TRANSFER','MOMO','VNPAY')),
    CONSTRAINT ck_payments_status   CHECK (status IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
    CONSTRAINT fk_payments_order    FOREIGN KEY (order_id) REFERENCES dbo.orders(id)
);
CREATE INDEX ix_payments_order  ON dbo.payments(order_id);
CREATE INDEX ix_payments_status ON dbo.payments(status);
GO

/* ============================================================================
   13. REVIEWS — chỉ review item đã mua (FK tới order_item_id)
============================================================================ */
CREATE TABLE dbo.reviews (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    product_id      BIGINT          NOT NULL,
    order_item_id   BIGINT          NOT NULL,
    rating          INT             NOT NULL,
    comment         NVARCHAR(1000)  NULL,
    created_at      DATETIME2       NOT NULL CONSTRAINT df_review_created DEFAULT SYSUTCDATETIME(),
    CONSTRAINT uk_reviews_user_order_item UNIQUE (user_id, order_item_id),
    CONSTRAINT ck_reviews_rating          CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT fk_reviews_user            FOREIGN KEY (user_id)       REFERENCES dbo.users(id),
    CONSTRAINT fk_reviews_product         FOREIGN KEY (product_id)    REFERENCES dbo.products(id),
    CONSTRAINT fk_reviews_order_item      FOREIGN KEY (order_item_id) REFERENCES dbo.order_items(id)
);
CREATE INDEX ix_reviews_product ON dbo.reviews(product_id);
GO

/* ============================================================================
   14. AUDIT_LOGS — append-only log mọi thao tác của admin/staff
============================================================================ */
CREATE TABLE dbo.audit_logs (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    actor_user_id   BIGINT          NULL,
    action          NVARCHAR(80)    NOT NULL,
    target_type     NVARCHAR(50)    NOT NULL,
    target_id       BIGINT          NOT NULL,
    changes         NVARCHAR(4000)  NULL,    -- JSON dump
    created_at      DATETIME2       NOT NULL CONSTRAINT df_audit_created DEFAULT SYSUTCDATETIME(),
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES dbo.users(id)
);
CREATE INDEX ix_audit_target     ON dbo.audit_logs(target_type, target_id);
CREATE INDEX ix_audit_actor      ON dbo.audit_logs(actor_user_id);
CREATE INDEX ix_audit_created_at ON dbo.audit_logs(created_at);
GO

/* ============================================================================
   15. SEED DATA — vài row mẫu để test ngay
   (password_hash dưới đây là bcrypt của "123456" — KHÔNG dùng cho production)
============================================================================ */

-- Users: 1 admin, 1 staff, 1 customer, 1 walk-in (POS dùng chung)
INSERT INTO dbo.users (email, password_hash, full_name, phone, role) VALUES
  (N'admin@sba301.local',    N'$2a$10$abcdefghijklmnopqrstuv', N'Admin Demo',     N'0900000001', 'ADMIN'),
  (N'staff@sba301.local',    N'$2a$10$abcdefghijklmnopqrstuv', N'Nhân viên A',    N'0900000002', 'STAFF'),
  (N'customer@sba301.local', N'$2a$10$abcdefghijklmnopqrstuv', N'Khách Demo',     N'0900000003', 'CUSTOMER'),
  (N'walkin@sba301.local',   NULL,                              N'Khách vãng lai', NULL,         'CUSTOMER');
GO

-- Categories: Nam, Nữ + 2 sub
INSERT INTO dbo.categories (parent_id, name, slug, display_order) VALUES
  (NULL, N'Nam',     'nam',    1),
  (NULL, N'Nữ',      'nu',     2);
INSERT INTO dbo.categories (parent_id, name, slug, display_order) VALUES
  ((SELECT id FROM dbo.categories WHERE slug='nam'), N'Áo thun nam',  'ao-thun-nam', 1),
  ((SELECT id FROM dbo.categories WHERE slug='nu'),  N'Váy nữ',       'vay-nu',      1);
GO

-- Products + variants (mỗi sản phẩm 2 size, 2 màu)
DECLARE @catAo  BIGINT = (SELECT id FROM dbo.categories WHERE slug='ao-thun-nam');
DECLARE @catVay BIGINT = (SELECT id FROM dbo.categories WHERE slug='vay-nu');

INSERT INTO dbo.products (category_id, name, slug, description, brand, base_price, status) VALUES
  (@catAo,  N'Áo thun cotton basic', 'ao-thun-cotton-basic', N'Áo thun cotton 100%, form regular fit', N'Local', 199000, 'ACTIVE'),
  (@catVay, N'Váy hoa mùa hè',       'vay-hoa-mua-he',       N'Váy chữ A, vải đũi mát',                N'Local', 349000, 'ACTIVE');

DECLARE @pAo  BIGINT = (SELECT id FROM dbo.products WHERE slug='ao-thun-cotton-basic');
DECLARE @pVay BIGINT = (SELECT id FROM dbo.products WHERE slug='vay-hoa-mua-he');

INSERT INTO dbo.product_variants (product_id, sku, size, color, price, stock_quantity) VALUES
  (@pAo,  'AO-COT-M-WHT', N'M', N'Trắng', 199000, 50),
  (@pAo,  'AO-COT-L-WHT', N'L', N'Trắng', 199000, 40),
  (@pAo,  'AO-COT-M-BLK', N'M', N'Đen',   199000, 30),
  (@pAo,  'AO-COT-L-BLK', N'L', N'Đen',   199000, 20),
  (@pVay, 'VAY-HOA-S-RED', N'S', N'Đỏ',   349000, 25),
  (@pVay, 'VAY-HOA-M-RED', N'M', N'Đỏ',   349000, 15);
GO

PRINT N'✅ Schema + seed data đã tạo xong.';
GO
