//Data đơn hàng giả. Shape làm phẳng từ entity Order+OrderItem+Payment.
//Quan hệ object(user, variant)--> rút gọn thành tên/id cho dễ hiển thị
// subtotal/totalAmount tính sắn (BE thật sẽ tự tính)
export const MOCK_ORDERS=[
    {
        id:1,
        orderCode: 'ORD-0001',
        customerName: 'Nguyễn Văn An',
        channel:'ONLINE',
        status:'PENDING',
        paymentStatus:'UNPAID',
        subtotal: 350000,
        shippingFee: 30000,
        totalAmount: 380000,
        note:'Giao giờ hành chính',
        createdByStaffName: null,   //đơn online tự đặt--> không có staff
        shippingAddress: '12 Lê Lợi, Q.1, TP.HCM',
        createdAt: '2026-05-28T09:15:00',
        items:[
            {
                id: 101,
                variantId: 11,
                productName: 'Áo thun cotton',
                variantInfo: 'M / Trắng',
                unitPrice: 175000,
                quantity:2,
                subtotal: 350000,
            }
        ],
        payments: [], //chưa thanh toán--> chưa có payment
    },
    {
        id: 2,
        orderCode: 'ORD-0002',
        customerName: 'Trần Thị Bình',
        channel: 'ONLINE',
        status: 'CONFIRMED',
        paymentStatus: 'UNPAID',
        subtotal: 540000,
        shippingFee: 30000,
        totalAmount: 570000,
        note: '',
        createdByStaffName: null,
        shippingAddress: '88 Cách Mạng Tháng 8, Q.3, TP.HCM',
        createdAt: '2026-05-29T14:02:00',
        items: [
            {
                id: 102, variantId: 21, productName: 'Quần jeans slim',
                variantInfo: '30 / Xanh đậm', unitPrice: 320000, quantity: 1,
                subtotal: 320000,
            },
            {
                id: 103, variantId: 12, productName: 'Áo thun cotton',
                variantInfo: 'L / Đen', unitPrice: 220000, quantity: 1, subtotal:
                    220000,
            },
        ],
        payments: [],
    },
    {
        id: 3,
        orderCode: 'ORD-0003',
        customerName: 'Lê Hoàng Cường',
        channel: 'ONLINE',
        status: 'SHIPPING',
        paymentStatus: 'UNPAID',
        subtotal: 320000,
        shippingFee: 30000,
        totalAmount: 350000,
        note: 'Gọi trước khi giao',
        createdByStaffName: null,
        shippingAddress: '5 Nguyễn Huệ, Q.1, TP.HCM',
        createdAt: '2026-05-30T08:40:00',
        items: [
            {
                id: 104, variantId: 21, productName: 'Quần jeans slim',
                variantInfo: '30 / Xanh đậm', unitPrice: 320000, quantity: 1,
                subtotal: 320000,
            },
        ],
        payments: [],
    },
    {
        id: 4,
        orderCode: 'ORD-0004',
        customerName: 'Phạm Thu Dung',
        channel: 'ONLINE',
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        subtotal: 450000,
        shippingFee: 30000,
        totalAmount: 480000,
        note: '',
        createdByStaffName: null,
        shippingAddress: '200 Hai Bà Trưng, Q.1, TP.HCM',
        createdAt: '2026-05-27T16:20:00',
        items: [
            {
                id: 105, variantId: 31, productName: 'Áo khoác gió',
                variantInfo: 'M / Xám', unitPrice: 450000, quantity: 1, subtotal:
                    450000,
            },
        ],
        payments: [
            {
                id: 1001, method: 'BANK_TRANSFER', amount: 480000,
                transactionRef: 'FT26052700123', status: 'SUCCESS', paidAt:
                    '2026-05-27T16:25:00',
            },
        ],
    },
    {
        id: 5,
        orderCode: 'ORD-0005',
        customerName: 'Khách lẻ',                 // đơn POS tại shop
        channel: 'IN_STORE',
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        subtotal: 175000,
        shippingFee: 0,                           // mua tại shop -> không phí ship
        totalAmount: 175000,
        note: '',
        createdByStaffName: 'Staff Hồng',         // POS -> có nhân viên tạo        đơn
        shippingAddress: null,                    // IN_STORE -> không có địa        chỉ giao
        createdAt: '2026-05-30T11:05:00',
        items: [
            {
                id: 106, variantId: 11, productName: 'Áo thun cotton',
                variantInfo: 'M / Trắng', unitPrice: 175000, quantity: 1,
                subtotal: 175000,
            },
        ],
        payments: [
            {
                id: 1002, method: 'CASH', amount: 175000,
                transactionRef: null, status: 'SUCCESS', paidAt:
                    '2026-05-30T11:05:00',
            },
        ],
    },
    {
        id: 6,
        orderCode: 'ORD-0006',
        customerName: 'Đỗ Minh Quân',
        channel: 'ONLINE',
        status: 'CANCELLED',
        paymentStatus: 'UNPAID',
        subtotal: 220000,
        shippingFee: 30000,
        totalAmount: 250000,
        note: 'Khách đổi ý',
        createdByStaffName: null,
        shippingAddress: '9 Pasteur, Q.1, TP.HCM',
        createdAt: '2026-05-26T10:00:00',
        items: [
            {
                id: 107, variantId: 12, productName: 'Áo thun cotton',
                variantInfo: 'L / Đen', unitPrice: 220000, quantity: 1, subtotal:
                    220000,
            },
        ],
        payments: [],
    },
]