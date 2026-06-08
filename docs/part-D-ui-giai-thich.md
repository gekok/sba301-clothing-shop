# Phần D — Giải thích 3 UI (Admin Order + Staff POS + Audit Logs)

> Tài liệu đọc lại: giải thích từng file, từng khái niệm React. Code thật nằm trong `frontend/src/`.
> Bối cảnh: 3 UI dùng **mock data** (chưa có backend), **bỏ auth**, mỗi page giữ `useState` riêng.

---

## 0. Cách chạy

Lần đầu phải cài thư viện (tạo `node_modules/`):

```powershell
cd C:\full\SBA301\ecommerce\frontend
npm install      # tải react, vite, react-bootstrap... về máy (1 lần)
npm run dev      # mở http://localhost:5173
```

**Vì sao `npm run dev` báo `'vite' is not recognized`?**
`package.json` chỉ *khai báo* thư viện cần, không phải bản thân thư viện. `npm install` mới tải code về `node_modules/`, trong đó có lệnh `node_modules/.bin/vite`. Chưa install thì lệnh `vite` chưa tồn tại.

3 route để mở thử:
- `/admin/orders` — Quản lý đơn
- `/staff/pos` — Bán tại shop
- `/admin/audit-logs` — Nhật ký

---

## 1. Bản đồ 9 file

| File | Vai trò |
|---|---|
| `utils/format.js` | Hàm hiển thị: tiền VND + ngày giờ |
| `utils/orderStatus.js` | "Bộ não": nhãn + màu trạng thái, **luật chuyển trạng thái** |
| `mock/orders.js` | 6 đơn giả (đủ 6 trạng thái + 2 kênh) |
| `mock/products.js` | Sản phẩm + variant cho POS (có 1 variant tồn = 0) |
| `mock/auditLogs.js` | 6 dòng log; `changes` là chuỗi JSON |
| `components/StatusBadge.jsx` | Badge màu dùng chung cho đơn & thanh toán |
| `App.jsx` | Khai báo route + link navbar |
| `pages/admin/OrderManagement.jsx` | **UI 1** — bảng đơn + lọc + đổi trạng thái + chi tiết |
| `pages/staff/POS.jsx` | **UI 2** — chọn hàng → giỏ → thanh toán → hoá đơn |
| `pages/admin/AuditLogs.jsx` | **UI 3** — bảng log + lọc + parse JSON |

Quan hệ phụ thuộc: `pages` dùng `mock` + `utils` + `components`. `App` ráp các `pages` vào route.

---

## 2. Nền tảng — utils

### `format.js`
- `formatVND(amount)` → `350000` thành `"350.000 ₫"` bằng `toLocaleString('vi-VN', {style:'currency', currency:'VND'})`. Có guard `Number(amount) || 0` chống data rác.
- `formatDateTime(iso)` → ISO thành `"dd/MM/yyyy HH:mm"`. Guard: chuỗi rỗng hoặc sai định dạng → trả `'-'`.

### `orderStatus.js` (quan trọng nhất)
4 map tra cứu + 1 bảng luật + 1 hàm:
- `ORDER_STATUS_LABEL` / `ORDER_STATUS_VARIANT`: nhãn tiếng Việt + màu Bootstrap cho trạng thái đơn.
- `PAYMENT_STATUS_LABEL` / `PAYMENT_STATUS_VARIANT`: tương tự cho thanh toán.
- `ORDER_TRANSITIONS`: **luật chuyển trạng thái** — ở mỗi trạng thái, admin được làm hành động gì:

```
PENDING ──Xác nhận──> CONFIRMED ──Giao hàng──> SHIPPING ──Đã giao──> DELIVERED ──Hoàn tất──> COMPLETED
   │                      │                         │
   └─────────── Hủy ──────┴──────── Hủy ────────────┘   (DELIVERED, COMPLETED, CANCELLED: không Hủy)
```

- `getValidTransitions(status)` → trả mảng hành động hợp lệ (dùng `?? []` để an toàn nếu gặp status lạ).

**Vì sao gom hết luật vào 1 file:** các UI chỉ *tra* map, không tự viết `if/switch`. Sửa nhãn/màu/quy trình → sửa 1 chỗ, mọi UI đổi theo (DRY). Đây là nền cho "data-driven UI" ở UI 1.

---

## 3. Mock data — bám shape entity thật

Nguyên tắc: mock mô phỏng đúng dạng **API trả về** (đã làm phẳng quan hệ object) để sau nối backend không phải sửa UI.

- **Quan hệ object → flatten**: `Order.user` (object) → `customerName` (string); `OrderItem.variant` → `variantId`; `AuditLog.actor` → `actorName`.
- **Snapshot giữ nguyên**: `OrderItem` có `productName/variantInfo/unitPrice` — đơn cũ bất biến dù sản phẩm đổi giá sau này.
- **Null đúng ngữ cảnh**: đơn `ONLINE` có `createdByStaffName: null`; đơn `IN_STORE` có `shippingAddress: null` + `shippingFee: 0`.
- **`payments: []` khi UNPAID**: chưa trả thì chưa có giao dịch.
- **`changes` là chuỗi JSON** (không phải object): khớp cột DB `String length 4000`, buộc UI phải `JSON.parse`.
- **id trỏ khớp nhau**: `variantId` trong orders (11,12,21,31) khớp variant trong products; `targetId` log khớp đơn.
- **Cố ý 1 variant tồn = 0** (`AT-CT-S-WHITE`) để test chặn thêm hàng hết tồn.

---

## 4. StatusBadge.jsx — component đầu tiên

```jsx
export default function StatusBadge({ status, type = 'order' }) {
  const isOrder = type === 'order';
  const label   = isOrder ? ORDER_STATUS_LABEL[status]   : PAYMENT_STATUS_LABEL[status];
  const variant = isOrder ? ORDER_STATUS_VARIANT[status] : PAYMENT_STATUS_VARIANT[status];
  return <Badge bg={variant ?? 'secondary'}>{label ?? status}</Badge>;
}
```

- **Component = hàm trả JSX.** `{ status, type }` là **props** (destructuring). `type = 'order'` là giá trị mặc định.
- **JSX**: `<Badge bg={...}>...</Badge>`. Dấu `{}` = nhúng JavaScript vào JSX. `bg` là prop màu nền; phần giữa 2 thẻ là **children** (chữ hiện ra).
- **`??`** (nullish): status lạ → màu xám + hiện nguyên chuỗi.
- **Vì sao tách**: cả UI 1 và POS đều cần badge → gói 1 lần, dùng `<StatusBadge status=... type="order|payment" />`.

---

## 5. App.jsx — routing

- `import` 2 page mới (OrderManagement, AuditLogs).
- `<Nav.Link as={Link} to="...">` — link SPA chuyển trang **không reload**.
- `<Route path="..." element={<Component/>} />` — URL nào → render component nào.

---

## 6. OrderManagement.jsx (UI 1) — chi tiết

### State
```jsx
const [orders, setOrders]       = useState(MOCK_ORDERS);
const [statusFilter, ...]        = useState('ALL');
const [channelFilter, ...]       = useState('ALL');
const [search, ...]              = useState('');
const [detailOrder, ...]         = useState(null);   // đơn đang mở modal
```
`useState(đầu)` → `[giá_trị, hàm_set]`. Gọi `set...` → React **vẽ lại** với giá trị mới.

### Lọc — useMemo
```jsx
const filteredOrders = useMemo(() => orders.filter((o) =>
  (statusFilter === 'ALL'  || o.status  === statusFilter) &&
  (channelFilter === 'ALL' || o.channel === channelFilter) &&
  o.orderCode.toLowerCase().includes(search.trim().toLowerCase())
), [orders, statusFilter, channelFilter, search]);
```
- `useMemo(fn, [deps])`: nhớ kết quả, chỉ tính lại khi `deps` đổi.
- `.filter(đk)`: giữ phần tử có điều kiện `true`. `=== 'ALL' ||` = "ALL thì cho qua hết".

### Đổi trạng thái — cập nhật BẤT BIẾN
```jsx
setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: toStatus } : o));
```
- Tạo **mảng mới** + **object mới** (`{...o, status}`). KHÔNG sửa thẳng `o.status = ...`.
- **Vì sao:** React so sánh tham chiếu để biết cần vẽ lại. Sửa tại chỗ → tham chiếu cũ → UI không cập nhật. **Quy tắc vàng: luôn tạo mới.**

### Nút action ĐỘNG (điểm hay nhất)
```jsx
{getValidTransitions(o.status).map((action) => (
  <Button key={action.to} variant={action.variant}
          onClick={() => handleChangeStatus(o.id, action.to)}>
    {action.label}
  </Button>
))}
```
- **Data-driven UI**: nút tự sinh từ bảng luật. `PENDING` → "Xác nhận"+"Hủy"; `COMPLETED` → không nút. Code UI **không có `if status`** — luật nằm ở `orderStatus.js`.
- **`onClick={() => fn()}`**: phải bọc arrow. Viết `onClick={fn()}` (không `() =>`) → chạy ngay lúc render, sai.

### Modal chi tiết
- `show={detailOrder !== null}`: bấm mã đơn → `setDetailOrder(o)` mở; `onHide` → `setDetailOrder(null)` đóng.
- `{detailOrder && (...)}`: chỉ render khi khác null (tránh đọc `.items` của null).
- `detailOrder?.orderCode`: optional chaining, null → undefined thay vì vỡ.
- `payments.length === 0 ? <p/> : <Table/>`: chưa trả hiện chữ, đã trả hiện bảng.

---

## 7. POS.jsx (UI 2) — chi tiết

### flatMap — làm phẳng variant
```jsx
const ALL_VARIANTS = MOCK_PRODUCTS.flatMap((p) =>
  p.variants.map((v) => ({ ...v, productName: p.name, label: `${p.name} - ${v.size}/${v.color}` })));
```
`flatMap` = `map` + làm phẳng 1 cấp → từ 3 sản phẩm lồng variant thành 1 danh sách variant phẳng kèm tên + nhãn.

### Giỏ hàng
- `addToCart`: `.find` xem đã có chưa → có thì +1 (chặn `>= stock`), chưa thì `[...prev, dòng mới]`.
- `changeQty(id, ±1)`: map cập nhật dòng, `.filter(qty > 0)` để giảm về 0 thì tự xoá.
- `removeItem`: `.filter` bỏ dòng.
- `total = cart.reduce((sum, it) => sum + it.price*it.quantity, 0)`: **reduce** gộp mảng về 1 số (tổng tiền).

### Thanh toán → hoá đơn
```jsx
setInvoice({ orderCode:`POS-${Date.now()}`, customerName: name.trim() || 'Khách lẻ',
             status:'COMPLETED', paymentStatus:'PAID', method:'CASH', items: cart, total });
...
if (invoice) { return <Card>…hoá đơn…</Card>; }   // early return
return <Row>…màn bán hàng…</Row>;
```
- Đơn POS đặt ngay `IN_STORE / COMPLETED / PAID / CASH` (đúng quy ước schema). Trống tên → "Khách lẻ" (walk-in).
- **Early return**: 1 component, 2 màn hình tuỳ state `invoice`. "Tạo đơn mới" → `setInvoice(null)`.
- `disabled={outOfStock}`: variant tồn = 0 → nút xám "Hết hàng".

---

## 8. AuditLogs.jsx (UI 3) — chi tiết

### Set — danh sách lọc không trùng
```jsx
const ACTIONS = [...new Set(MOCK_AUDIT_LOGS.map((l) => l.action))];
```
`map` lấy action → `Set` loại trùng → `[...]` về mảng. Tự suy ô lọc từ data, không gõ tay.

### Parse changes JSON an toàn
```jsx
function renderChanges(str) {
  try {
    const obj = JSON.parse(str);
    return Object.entries(obj).map(([f, v]) =>
      (v && typeof v === 'object' && 'from' in v && 'to' in v)
        ? `${f}: ${v.from} → ${v.to}` : `${f}: ${JSON.stringify(v)}`).join('; ');
  } catch { return str; }  // chuỗi hỏng → trả nguyên, không vỡ trang
}
```
- `JSON.parse` đổi chuỗi → object. Entity lưu `changes` dạng chuỗi nên buộc parse.
- `try/catch`: phòng thủ, data bẩn không làm sập UI.
- `Object.entries` → `[key,value]`; value `{from,to}` → "status: PENDING → CONFIRMED".

---

## 9. 6 pattern React cốt lõi (nắm là đọc được hết)

1. **`useState`** → dữ liệu sống; gọi `set...` → React vẽ lại.
2. **Cập nhật bất biến** → `{...obj, field}`, `[...arr, x]`; KHÔNG sửa trực tiếp.
3. **`.map()` render list** + **`key` duy nhất** (bắt buộc).
4. **Controlled input** → `value={state}` + `onChange={e => set(e.target.value)}`.
5. **Render có điều kiện** → `{cond && <JSX/>}`, `? :`, early return.
6. **`onClick={() => fn()}`** → bọc arrow để không chạy lúc render.

Hàm mảng hay dùng: `.map` (biến đổi), `.filter` (lọc), `.find` (tìm 1), `.reduce` (gộp về 1 giá trị), `.flatMap` (map + làm phẳng), `new Set` (loại trùng).

---

## 10. Khi nối backend thật (sau này)

Mỗi page hiện đọc từ `MOCK_*`. Khi BE phần D xong:
1. Thay `useState(MOCK_ORDERS)` bằng gọi API trong `useEffect` (vd `api.get('/admin/orders')`).
2. `handleChangeStatus` gọi `api.put('/admin/orders/{id}/status')` rồi cập nhật state theo kết quả.
3. POS `handleCheckout` gọi `api.post('/staff/orders/pos')`.
4. Vì shape mock đã bám entity thật, phần JSX hiển thị gần như **không phải sửa**.
5. Thêm lại auth (phần A): `ProtectedRoute` chặn route theo role, axios đã sẵn interceptor gắn JWT.
