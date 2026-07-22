//1. nhãn tiếng VIệt cho trạng thái đơn (Khớp enum OrderStatus.java)
export const ORDER_STATUS_LABEL ={
    PENDING:'Chờ xác nhận',
    CONFIRMED:'Đã xác nhận',
    SHIPPING:'Đang giao',
    DELIVERED:'Đã giao',
    CANCELLED:'Đã hủy',
    COMPLETED:'Hoàn tất',
};
//2. MÀu badge bootstrap cho trạng thái đơn
export const ORDER_STATUS_VARIANT={
    PENDING: 'secondary',
    CONFIRMED: 'info',
    SHIPPING: 'primary',
    DELIVERED: 'success',
    CANCELLED: 'danger',
    COMPLETED: 'dark',
};
//2b. Nhãn kênh bán (Khớp enum OrderChannel.java)
// Gom vào đây vì trước đó câu `channel === 'ONLINE' ? 'Online' : 'Tại shop'` bị chép
// ở 3 chỗ trong OrderManagement và 1 chỗ ghi cứng trong POS.
export const CHANNEL_LABEL={
    ONLINE: 'Online',
    IN_STORE: 'Tại shop',
};
//3. Trạng thái thanh toán (Khớp enum OrderPaymentStatus.java)
export const PAYMENT_STATUS_LABEL={
    UNPAID: 'Chưa thanh toán',
    PAID: 'Đã thanh toán',
    REFUNDED: 'Đã hoàn tiền',
};
export const PAYMENT_STATUS_VARIANT={
    UNPAID: 'warning',
    PAID: 'success',
    REFUNDED: 'secondary',
};
//4. LUẬT chuyển trạng thái: khi ở trạng thái hiện tại, admin được bấm nút gì
// Mỗi hành động gồm: trạng thái đích(to)+ chữ trên nút (label) + màu nút (variant)
export const ORDER_TRANSITIONS={
    PENDING: [
        {to: 'CONFIRMED', label: 'Xác nhận', variant: 'info'},
        {to: 'CANCELLED', label: 'Hủy', variant: 'danger'},
    ],
    CONFIRMED: [
        {to: 'SHIPPING', label: 'Giao hàng', variant: 'primary'},
        {to: 'CANCELLED', label: 'Hủy', variant: 'danger'},
    ],
    SHIPPING: [
        // Chữ trên nút phải là HÀNH ĐỘNG admin sắp làm, không phải trạng thái đích.
        // "Đã giao" trùng y hệt ORDER_STATUS_LABEL.DELIVERED nên đọc như một lời khẳng
        // định trạng thái, lệch với 3 nút anh em đều là động từ (Xác nhận / Giao hàng / Hủy).
        {to: 'DELIVERED', label: 'Xác nhận đã giao', variant: 'success'},
        {to: 'CANCELLED', label: 'Hủy', variant: 'danger'},
    ],
    DELIVERED: [
        {to: 'COMPLETED', label: 'Hoàn tất', variant: 'success'},
    ],
    COMPLETED:[],
    CANCELLED:[],
};
//5. lấy danh sách hành động hợp lệ cho 1 trạng thái(an toàn nếu gặp key lạ)
export function getValidTransitions(status){
    return ORDER_TRANSITIONS[status] ?? [];
}
