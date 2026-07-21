# Phần D — Đánh giá Cohesion & Coupling: Proxy pattern + Composite pattern

> Đối tượng đánh giá: 10 file demo trong `backend/src/main/java/com/sba301/ecommerce/designpatterns/`
> (Proxy: `proxy/*.java` — Protection Proxy mirror rule của `SecurityConfig`; Composite: `composite/*.java`
> — cây category mirror quan hệ `parent/children` của `Category` entity thật).
> Đây là code demo độc lập cho bài design pattern, KHÔNG phải feature Category/Security thật
> (2 chỗ đó vẫn là stub trống của nhóm — xem README/`docs/be-architecture.md`).
> Code đã compile (`mvn -q -o compile` → exit 0) và chạy thật (`ProxyPatternDemo`, `CompositePatternDemo`)
> trước khi viết đánh giá này, để đảm bảo phân tích dựa trên hành vi thật chứ không suy diễn.

---

## 0. Thang đo (range) tham chiếu

### Range of Cohesion — 7 mức, thấp → cao

| # | Mức | Ý nghĩa |
|---|---|---|
| 1 | **Coincidental** (ngẫu nhiên) | Các phần tử trong module không liên quan gì nhau, gom bừa vào 1 chỗ |
| 2 | **Logical** (logic) | Các phần tử làm việc *cùng loại* nhưng chọn nhánh bằng 1 flag đầu vào (vd 1 hàm xử lý nhiều loại input bằng switch-case) |
| 3 | **Temporal** (thời điểm) | Các phần tử chỉ liên quan vì cùng chạy ở 1 thời điểm (vd gom hết việc khởi tạo vào `init()`) |
| 4 | **Procedural** (thủ tục) | Các phần tử phải chạy theo 1 trình tự nhất định để đúng luồng, nhưng không nhất thiết chia sẻ dữ liệu |
| 5 | **Communicational** (giao tiếp) | Các phần tử cùng thao tác trên **cùng 1 tập dữ liệu** |
| 6 | **Sequential** (tuần tự) | Output của phần tử này là **input trực tiếp** của phần tử kế tiếp (kiểu pipeline) |
| 7 | **Functional** (chức năng) | **Mọi** phần tử đều cần thiết để hoàn thành đúng 1 nhiệm vụ duy nhất, rõ ràng — mức tốt nhất |

### Range of Coupling — 6 mức, chặt/xấu → lỏng/tốt

| # | Mức | Ý nghĩa |
|---|---|---|
| 1 | **Content** (nội dung) | Module A sửa trực tiếp dữ liệu nội bộ / nhảy vào giữa code của module B — tệ nhất |
| 2 | **Common** (chung) | Nhiều module cùng đọc/ghi 1 vùng dữ liệu toàn cục (biến `static` non-final, global state) |
| 3 | **External** (ngoại vi) | Phụ thuộc định dạng/giao thức áp đặt từ bên ngoài (file format cố định, protocol, device) |
| 4 | **Control** (điều khiển) | Module A truyền 1 flag/mã điều khiển bảo module B chạy nhánh logic nào |
| 5 | **Stamp** (cấu trúc) | Truyền nguyên 1 struct/object dữ liệu dù callee chỉ cần vài field trong đó |
| 6 | **Data** (dữ liệu) | Chỉ truyền tham số dữ liệu đơn giản, đúng-đủ cái callee cần — mức tốt nhất |

---

## 1. Proxy pattern — Cohesion từng class

| Class | Vị trí | Mức cohesion | Giải thích |
|---|---|---|---|
| `CategoryDto` | `CategoryDto.java:6` | **Functional** (data-level) | Record thuần, không có xử lý nên không áp dụng thang cổ điển theo đúng nghĩa — nhưng cả 4 field (`id,name,slug,active`) đều mô tả đúng 1 khái niệm duy nhất "1 category", không field nào lạc mục đích. |
| `Requester` | `Requester.java:11` | **Functional** (data-level) | Tương tự — 2 field (`displayName, role`) cùng mô tả đúng 1 khái niệm "người gọi". |
| `CategoryManagementService` | `CategoryManagementService.java:12-23` | **Functional** | 4 method (`list/create/update/delete`) đúng là 4 mảnh bắt buộc của **đúng 1 nhiệm vụ**: quản lý vòng đời Category. Không method nào đứng ngoài mục đích đó. |
| `RealCategoryManagementService` | `RealCategoryManagementService.java:24-69` | **Functional** | Mọi method cùng thao tác trên `storage`/`idSequence` **và** cùng phục vụ đúng 1 nhiệm vụ "lưu trữ + CRUD category". Không phải chỉ Communicational (cùng data) vì các method còn *cần thiết lẫn nhau* để hoàn thành nhiệm vụ, không phải nhóm sub-function rời rạc. |
| `CategorySecurityProxy` | `CategorySecurityProxy.java:20-66` | **Functional** | 4 method override + 1 helper `checkWritePermission()` (dòng 58-65) — tất cả chỉ phục vụ đúng 1 việc: kiểm soát quyền trước khi uỷ quyền cho RealSubject. Helper không phải tiện ích rời rạc mà là bước bắt buộc của chính nhiệm vụ đó. |
| `ProxyPatternDemo` | `ProxyPatternDemo.java:14-57` | **Procedural** | `main()` chạy 4 kịch bản theo **thứ tự cố định** để kể câu chuyện demo (list → create bị chặn → create thành công → delete thành công); thứ tự quan trọng cho mạch demo nhưng từng `run(...)` độc lập, không truyền output của bước trước làm input trực tiếp cho bước sau. Đây là mức **bình thường/chấp nhận được cho class kiểu "entry point demo/test"**, không áp dụng tiêu chuẩn của class nghiệp vụ. |

## 2. Proxy pattern — Coupling giữa các thành phần

| Quan hệ | Vị trí | Loại coupling | Giải thích |
|---|---|---|---|
| `CategorySecurityProxy` → `CategoryManagementService` (field `realSubject`) | `CategorySecurityProxy.java:24,27` | **Data** (qua interface/abstraction) | Kiểu field là **interface**, không phải class cụ thể — Proxy không biết gì về nội bộ `RealCategoryManagementService` ngoài 4 method public của interface. Đây là ví dụ Dependency Inversion giúp coupling ở mức tốt nhất có thể. |
| `CategorySecurityProxy` → `Requester` (field + `.role()`, `.displayName()`) | `CategorySecurityProxy.java:25,59-60` | **Stamp** | Truyền nguyên 1 record thay vì decompose thành `String, Role` rời — chấp nhận được vì `Requester` là 1 khái niệm domain trọn vẹn, tách rời chỉ làm dài signature chứ không giảm coupling thật. |
| `CategorySecurityProxy` → `realSubject.createCategory/updateCategory/deleteCategory` (forward `request`, `id`) | `CategorySecurityProxy.java:41,47,53` | **Data** | Chỉ forward tham chiếu nguyên vẹn, Proxy không đọc/sửa field bên trong `CategoryDto`. |
| `ProxyPatternDemo` → `new CategorySecurityProxy(...)`, `new Requester(...)`, `new CategoryDto(...)` | `ProxyPatternDemo.java:17-40` | **Data** | Composition-root buộc biết constructor cụ thể — bình thường cho lớp lắp ráp/demo (ở Spring thật sẽ thay bằng `@Bean`/DI). Tham số chỉ là `String/Long/boolean` hoặc record đơn giản, không có flag điều khiển nội bộ callee. |
| *(toàn bộ 6 file)* | — | **Không có Control** | Không method nào nhận `boolean`/`enum` "mode" để bảo callee chạy nhánh nào — `checkWritePermission()` tự quyết định dựa trên field nội bộ, không nhận flag từ ngoài. |
| *(toàn bộ 6 file)* | — | **Không có Common** | `storage`, `idSequence` (RealSubject) và `WRITE_ALLOWED_ROLES` (Proxy) đều `private` — không có `static` non-final hay global state nào bị nhiều class cùng đọc/ghi. |
| *(toàn bộ 6 file)* | — | **Không có Content** | Không class nào truy cập trực tiếp field private của class khác; mọi tương tác qua public method. |
| *(toàn bộ 6 file)* | — | **External — N/A** | Không có phụ thuộc định dạng file/protocol/device bên ngoài trong phạm vi demo này. |

---

## 3. Composite pattern — Cohesion từng class

| Class | Vị trí | Mức cohesion | Giải thích |
|---|---|---|---|
| `CategoryComponent` | `CategoryComponent.java:15-30` | **Functional** | 5 method (`getName, isActive, getTotalProductCount, countActiveCategories, display`) đều định nghĩa đúng "khả năng của 1 node trong cây category" — không method nào lạc mục đích. |
| `CategoryLeaf` | `CategoryLeaf.java:8-44` | **Functional** | 3 field (`name, active, productCount`) + method chỉ đọc/trả trực tiếp từ 3 field đó — nhiệm vụ duy nhất: biểu diễn 1 category lá. |
| `CategoryComposite` | `CategoryComposite.java:17-76` | **Functional** | 4 field + `addChild/removeChild` + 4 method override đều phục vụ đúng 1 nhiệm vụ: biểu diễn 1 category có con và **tự tổng hợp đệ quy** dữ liệu từ cây con (`getTotalProductCount` dòng 52-58, `countActiveCategories` dòng 61-67) — đây chính là lý do class tồn tại, không có method nào ngoài mục đích đó. |
| `CompositePatternDemo` | `CompositePatternDemo.java:8-33` | **Sequential** | Bước 1 "dựng cây" (dòng 11-23) tạo ra **đúng cấu trúc dữ liệu** mà bước 2 `display()` (dòng 26) và bước 3 `getTotalProductCount()/countActiveCategories()` (dòng 30-31) cần làm input trực tiếp — quan hệ build → dùng kết quả build là 1 pipeline thật, cao hơn 1 bậc so với `ProxyPatternDemo` (chỉ Procedural) vì ở đây có sự phụ thuộc dữ liệu thực sự, không chỉ thứ tự kể chuyện. |

## 4. Composite pattern — Coupling giữa các thành phần

| Quan hệ | Vị trí | Loại coupling | Giải thích |
|---|---|---|---|
| `CategoryComposite` → `CategoryComponent` (field `children`, gọi `child.getTotalProductCount()/countActiveCategories()/display()`) | `CategoryComposite.java:22,54-56,63-65,72-74` | **Data** (qua interface, mức tối ưu) | Composite chỉ biết interface `CategoryComponent`, hoàn toàn không phân biệt con là `CategoryLeaf` hay `CategoryComposite` khác (đa hình thuần). Đây chính là lý do sách vở dùng Composite pattern làm ví dụ kinh điển giảm coupling giữa client và cấu trúc cây phức tạp. |
| `CategoryLeaf` / `CategoryComposite` implements `CategoryComponent` | `CategoryLeaf.java:8`, `CategoryComposite.java:17` | **Data** (structural/interface) | Coupling bắt buộc để tuân thủ hợp đồng interface — không tính là coupling xấu. |
| `CompositePatternDemo` → `new CategoryComposite(...)`, `new CategoryLeaf(...)` | `CompositePatternDemo.java:11-20` | **Data** | Chỉ truyền `String/boolean/int` — **không** truyền record/struct nào, nên coupling ở đây còn lỏng hơn cả `ProxyPatternDemo` (phải truyền `Requester`, tức Stamp). |
| *(toàn bộ 4 file)* | — | **Không có Control/Common/Content/External** | Cùng lý do như Proxy: không flag điều khiển, không global state (`children` là field private theo từng instance), không truy cập field private xuyên class, không phụ thuộc định dạng ngoài. |

---

## 5. Nhìn tổng thể trên range

Thay vì canh cột bằng khoảng trắng (dễ lệch khi đổi font/công cụ hiển thị), bảng dưới đánh dấu trực tiếp class/quan hệ nào rơi vào mức nào trên range — đọc theo cột từ trái (xấu/thấp) sang phải (tốt/cao):

**Cohesion — 8/10 class rơi đúng cột Functional (tốt nhất), 2 class runner thấp hơn 1-2 bậc:**

| Coincidental | Logical | Temporal | Procedural | Communicational | Sequential | Functional |
|---|---|---|---|---|---|---|
| — | — | — | `ProxyPatternDemo` | — | `CompositePatternDemo` | 8 class còn lại: `CategoryDto`, `Requester`, `CategoryManagementService`, `RealCategoryManagementService`, `CategorySecurityProxy`, `CategoryComponent`, `CategoryLeaf`, `CategoryComposite` |

**Coupling — 7 quan hệ cụ thể đã liệt kê ở mục 2 và 4, tất cả rơi vào 2 cột tốt nhất (Stamp, Data), không chạm 4 cột xấu bên trái:**

| Content | Common | External | Control | Stamp | Data |
|---|---|---|---|---|---|
| — | — | — | — | `CategorySecurityProxy` ↔ `Requester` (1 quan hệ) | 6 quan hệ còn lại (liệt kê ở mục 2, 4) |

## 6. Nhận xét

- **8/10 class đạt Functional cohesion** — mức cao nhất của thang. Đây không phải trùng hợp: cả Proxy lẫn Composite đều là pattern hướng "single responsibility" theo thiết kế gốc (Proxy tách riêng access-control khỏi business logic; Composite tách riêng "biểu diễn 1 node" khỏi "tổng hợp cây"), nên khi implement đúng GoF, cohesion cao gần như là hệ quả tự nhiên chứ không cần cố ý tối ưu thêm.
- **2 class runner (`ProxyPatternDemo`, `CompositePatternDemo`) rơi xuống Procedural/Sequential** — thấp hơn 8 class còn lại nhưng **đây là mức bình thường và chấp nhận được** cho class kiểu entry-point/demo/test: nhiệm vụ của chúng vốn là "trình diễn theo kịch bản", không phải business logic, nên không nên áp cùng tiêu chuẩn Functional.
- **Coupling toàn bộ 10 file chỉ nằm ở 2 mức tốt nhất (Data, Stamp)** — không có Control/Common/Content ở bất kỳ đâu. Điểm mấu chốt tạo ra kết quả này: **cả 2 pattern đều giao tiếp qua interface** (`CategoryManagementService`, `CategoryComponent`) thay vì qua class cụ thể — đúng nguyên lý "program to an interface, not an implementation" mà GoF patterns hướng tới.
- **Giới hạn cần lưu ý**: đây là đánh giá trên **code demo cô lập** (in-memory, không DB, không Spring context thật). Khi ráp `CategorySecurityProxy`/`RealCategoryManagementService` vào Spring thật (thay `storage` bằng `CategoryRepository`, thay `Requester` bằng `Authentication` từ `SecurityContextHolder`), cohesion/coupling có thể đổi nhẹ — ví dụ nếu Proxy inject thêm `HttpServletRequest` để tự đọc requester thay vì nhận qua tham số, quan hệ đó sẽ chuyển từ Data coupling (tham số tường minh) sang phụ thuộc implicit vào request-scope của Spring (gần External coupling hơn).
