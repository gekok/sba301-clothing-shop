package com.sba301.ecommerce.features.order.service;

import org.springframework.stereotype.Service;

// TODO: implements OrderService. @RequiredArgsConstructor deps: OrderRepository, UserRepository (+ Cart/Variant repo neu build tu cart).
//   createOrder: build OrderItem tu request/cart, tinh subtotal/total, gen orderCode, status=PENDING, paymentStatus=UNPAID.
//     (KHONG xu ly Payment - feature defer. shippingAddressId nullable - Address defer.)
//   getByCode/listMyOrders: ownership theo user hien tai. updateStatus: staff/admin.
@Service
public class OrderServiceImpl implements OrderService {
}
