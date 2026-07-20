export const voucherCatalog = {
  FREESHIP30: {
    code: 'FREESHIP30',
    type: 'shipping',
    amount: 30000,
    description: 'Giảm tối đa 30.000VND phí vận chuyển.',
  },
  SALE40K: {
    code: 'SALE40K',
    type: 'fixed',
    amount: 40000,
    description: 'Giảm trực tiếp 40.000VND vào tổng tiền hàng.',
  },
  SAVE10: {
    code: 'SAVE10',
    type: 'percent',
    amount: 10,
    maxDiscount: 120000,
    description: 'Giảm 10% tối đa 120.000VND.',
  },
};

export const addressesMock = [
  {
    id: 301,
    recipientName: 'Khach Demo',
    phone: '0900000003',
    province: 'TP. Ho Chi Minh',
    district: 'Quan 3',
    ward: 'Vo Thi Sau',
    street: '12 Nguyen Thuong Hien',
    isDefault: true,
  },
  {
    id: 302,
    recipientName: 'Khach Demo',
    phone: '0900000003',
    province: 'TP. Ho Chi Minh',
    district: 'Quan 1',
    ward: 'Da Kao',
    street: '83 Dinh Tien Hoang',
    isDefault: false,
  },
];

export const shippingMethodsMock = [
  {
    id: 'standard',
    name: 'Giao tiêu chuẩn',
    eta: '2-4 ngày',
    fee: 25000,
    description: 'Phù hợp đơn hàng thông thường trong nội thành.',
  },
  {
    id: 'express',
    name: 'Giao nhanh',
    eta: 'Trong ngày (nội thành)',
    fee: 45000,
    description: 'Ưu tiên kho và đối tác vận chuyển nhanh.',
  },
];
