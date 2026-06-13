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
        {to: 'DELIVERED', label: 'Đang giao', variant: 'success'},
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