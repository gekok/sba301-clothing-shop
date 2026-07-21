// ============================================================
// MOCK DATA — feature/reviews
// Gộp toàn bộ dữ liệu giả (users, products, variants, orders, reviews) vào 1 file
// vì đây là nhánh test độc lập của feature reviews, chưa cần tách theo từng feature
// khác (products/orders vốn thuộc feature khác trong dự án thật, ở đây chỉ giữ đủ
// field để feature reviews chạy được, không phụ thuộc code của nhóm khác).
// ============================================================

export const users = [
  { id: 1, fullName: 'Nguyễn Văn A', email: 'a@example.com', role: 'CUSTOMER' },
  { id: 2, fullName: 'Trần Thị B', email: 'b@example.com', role: 'CUSTOMER' },
  { id: 3, fullName: 'Lê Văn C', email: 'c@example.com', role: 'CUSTOMER' },
  { id: 4, fullName: 'Phạm Thị D', email: 'd@example.com', role: 'CUSTOMER' },
  { id: 5, fullName: 'Hoàng Văn E', email: 'e@example.com', role: 'CUSTOMER' },
]

// Giả lập user đang đăng nhập (sau này lấy từ JWT/session thật)
export const currentUser = users[0]

export const products = [
  {
    id: 1,
    name: 'Tai nghe Bluetooth AirPro X',
    slug: 'tai-nghe-bluetooth-airpro-x',
    basePrice: 890000,
    category: { id: 1, name: 'Phụ kiện điện tử' },
    images: [{ id: 1, url: 'https://picsum.photos/seed/p1/300/300', displayOrder: 0, isPrimary: true }],
  },
  {
    id: 2,
    name: 'Bàn phím cơ Keymaster 87 Key',
    slug: 'ban-phim-co-keymaster-87-key',
    basePrice: 1290000,
    category: { id: 1, name: 'Phụ kiện điện tử' },
    images: [{ id: 2, url: 'https://picsum.photos/seed/p2/300/300', displayOrder: 0, isPrimary: true }],
  },
  {
    id: 3,
    name: 'Áo hoodie Basic Unisex',
    slug: 'ao-hoodie-basic-unisex',
    basePrice: 350000,
    category: { id: 2, name: 'Thời trang' },
    images: [{ id: 3, url: 'https://picsum.photos/seed/p3/300/300', displayOrder: 0, isPrimary: true }],
  },
  {
    id: 4,
    name: 'Bình giữ nhiệt Thermos 500ml',
    slug: 'binh-giu-nhiet-thermos-500ml',
    basePrice: 219000,
    category: { id: 3, name: 'Đồ gia dụng' },
    images: [{ id: 4, url: 'https://picsum.photos/seed/p4/300/300', displayOrder: 0, isPrimary: true }],
  },
]

export const productVariants = [
  { id: 11, productId: 1, sku: 'AIRPRO-X-BLK', size: 'Standard', color: 'Đen', price: 890000, stockQuantity: 50, isActive: true },
  { id: 12, productId: 1, sku: 'AIRPRO-X-WHT', size: 'Standard', color: 'Trắng', price: 890000, stockQuantity: 30, isActive: true },
  { id: 21, productId: 2, sku: 'KEYM-87-BROWN', size: '87-Key', color: 'Đen', price: 1290000, stockQuantity: 20, isActive: true },
  { id: 31, productId: 3, sku: 'HOODIE-BASIC-M', size: 'M', color: 'Xám', price: 350000, stockQuantity: 40, isActive: true },
  { id: 32, productId: 3, sku: 'HOODIE-BASIC-L', size: 'L', color: 'Xám', price: 350000, stockQuantity: 25, isActive: true },
  { id: 41, productId: 4, sku: 'THERMOS-500-RED', size: '500ml', color: 'Đỏ', price: 219000, stockQuantity: 60, isActive: true },
]

// --- helper nội bộ, chỉ dùng để dựng sẵn dữ liệu orders bên dưới ---
function variantLabel(variant) {
  return [variant.size, variant.color].filter(Boolean).join(' / ')
}

function buildItem({ id, orderId, variantId, productName, quantity }) {
  const variant = productVariants.find((v) => v.id === variantId)
  const unitPrice = variant.price
  return {
    id,
    orderId,
    variantId,
    productName,
    variantInfo: variantLabel(variant),
    unitPrice,
    quantity,
    subtotal: unitPrice * quantity,
  }
}

function buildOrder({ id, orderCode, status, paymentStatus, createdAt, items, shippingFee = 0 }) {
  const subtotal = items.reduce((sum, it) => sum + it.subtotal, 0)
  return {
    id,
    orderCode,
    userId: currentUser.id,
    status,
    paymentStatus,
    subtotal,
    shippingFee,
    totalAmount: subtotal + shippingFee,
    createdAt,
    items,
  }
}

const item1001 = buildItem({ id: 1001, orderId: 101, variantId: 11, productName: 'Tai nghe Bluetooth AirPro X', quantity: 1 })
const item1002 = buildItem({ id: 1002, orderId: 101, variantId: 41, productName: 'Bình giữ nhiệt Thermos 500ml', quantity: 2 })
const item1003 = buildItem({ id: 1003, orderId: 102, variantId: 31, productName: 'Áo hoodie Basic Unisex', quantity: 1 })

export const orders = [
  buildOrder({
    id: 101,
    orderCode: 'ORD-2026-0101',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    shippingFee: 20000,
    createdAt: '2026-06-12T00:00:00.000Z',
    items: [item1001, item1002],
  }),
  buildOrder({
    id: 102,
    orderCode: 'ORD-2026-0102',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    shippingFee: 15000,
    createdAt: '2026-06-24T00:00:00.000Z',
    items: [item1003],
  }),
]

// orderItemId: null -> review demo của người khác, không gắn với 1 order cụ thể trong mock này.
// review id=6 gắn đúng OrderItem #1001 (đơn #101) của currentUser để demo luồng "đã đánh giá rồi".
export const initialReviews = [
  { id: 1, userId: 2, productId: 1, orderItemId: null, rating: 5, comment: 'Âm thanh chi tiết, pin trâu, đáng tiền!', createdAt: '2026-06-20T08:30:00.000Z' },
  { id: 2, userId: 3, productId: 1, orderItemId: null, rating: 4, comment: 'Đeo lâu hơi đau tai nhưng chất lượng ổn.', createdAt: '2026-06-18T10:00:00.000Z' },
  { id: 3, userId: 4, productId: 1, orderItemId: null, rating: 3, comment: 'Kết nối bluetooth đôi lúc bị giật.', createdAt: '2026-06-10T14:20:00.000Z' },
  { id: 4, userId: 2, productId: 2, orderItemId: null, rating: 5, comment: 'Gõ rất sướng, switch êm, đèn led đẹp.', createdAt: '2026-06-22T09:00:00.000Z' },
  { id: 5, userId: 5, productId: 3, orderItemId: null, rating: 2, comment: 'Vải hơi mỏng so với mong đợi.', createdAt: '2026-06-15T11:00:00.000Z' },
  { id: 6, userId: 1, productId: 1, orderItemId: 1001, rating: 4, comment: 'Mình dùng 2 tuần thấy ổn, sạc nhanh.', createdAt: '2026-06-25T07:00:00.000Z' },
]
