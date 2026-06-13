package com.sba301.ecommerce.entity;

import com.sba301.ecommerce.entity.enums.OrderChannel;
import com.sba301.ecommerce.entity.enums.OrderPaymentStatus;
import com.sba301.ecommerce.entity.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders",
        uniqueConstraints = @UniqueConstraint(name = "uk_orders_code", columnNames = "order_code"),
        indexes = {
                @Index(name = "ix_orders_user", columnList = "user_id"),
                @Index(name = "ix_orders_status", columnList = "status"),
                @Index(name = "ix_orders_channel", columnList = "channel"),
                @Index(name = "ix_orders_created_at", columnList = "created_at")
        })
@Getter
@Setter
@NoArgsConstructor
public class Order extends BaseEntity {

    @Column(name = "order_code", nullable = false, length = 30)
    private String orderCode;

    // Customer (for walk-in POS, point to a shared "walkin" user)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_orders_user"))
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderChannel channel;

    // NULL for self-service online; set when staff creates / assists order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_staff_id",
            foreignKey = @ForeignKey(name = "fk_orders_staff"))
    private User createdByStaff;

    // NULL for IN_STORE
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_address_id",
            foreignKey = @ForeignKey(name = "fk_orders_address"))
    private Address shippingAddress;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "shipping_fee", nullable = false, precision = 18, scale = 2)
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private OrderPaymentStatus paymentStatus = OrderPaymentStatus.UNPAID;

    @Column(length = 500)
    private String note;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Payment> payments = new ArrayList<>();
}
