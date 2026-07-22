package com.sba301.ecommerce.config;


import com.sba301.ecommerce.features.entities.Order;
import com.sba301.ecommerce.features.entities.OrderItem;
import com.sba301.ecommerce.features.entities.ProductVariant;
import com.sba301.ecommerce.features.entities.User;
import com.sba301.ecommerce.features.entities.enums.OrderChannel;
import com.sba301.ecommerce.features.entities.enums.OrderPaymentStatus;
import com.sba301.ecommerce.features.entities.enums.OrderStatus;
import com.sba301.ecommerce.features.order.repository.AdminOrderRepository;
import com.sba301.ecommerce.features.pos.repository.PosVariantRepository;
import com.sba301.ecommerce.features.pos.repository.UserPosRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Tạo sẵn vài đơn ở các trạng thái khác nhau để test màn "Quản lý đơn hàng".
 *
 * Vì sao cần: DatabaseSeeder chỉ tạo user + sản phẩm, không tạo đơn nào. Không có đơn
 * thì bảng trống, không có nút chuyển trạng thái nào để bấm thử.
 *
 * Vì sao dùng ApplicationReadyEvent chứ không CommandLineRunner: seeder này cần user và
 * sản phẩm do DatabaseSeeder tạo ra trước. Nhiều CommandLineRunner không có thứ tự đảm bảo,
 * còn ApplicationReadyEvent luôn bắn SAU khi mọi CommandLineRunner chạy xong.
 *
 * Đây là dữ liệu dựng cho môi trường dev. Trước khi nộp/deploy thật thì xoá class này.
 */
@Component
@RequiredArgsConstructor
public class DemoOrderSeeder {

    private static final Logger logger = LoggerFactory.getLogger(DemoOrderSeeder.class);
    private static final BigDecimal ONLINE_SHIPPING_FEE = new BigDecimal("30000");

    private final AdminOrderRepository adminOrderRepository;
    private final UserPosRepository userPosRepository;
    private final PosVariantRepository posVariantRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seed() {
        // Chỉ gieo khi DB chưa có đơn nào. Chạy lại app lần 2 sẽ không nhân bản dữ liệu.
        if (adminOrderRepository.count() > 0) {
            return;
        }

        User customer = userPosRepository.findUserByEmail("customer@sba301.local");
        User admin = userPosRepository.findUserByEmail("admin@sba301.local");
        List<ProductVariant> variants = posVariantRepository.findActiveWithProduct();

        if (customer == null || variants.isEmpty()) {
            logger.warn(">>> DemoOrderSeeder: chua co user/san pham de tao don demo. Bo qua.");
            return;
        }

        List<Order> orders = new ArrayList<>();
        // Mỗi trạng thái 1 đơn để bấm thử được đủ các nhánh chuyển trạng thái.
        orders.add(build("SEED-0001", customer, null, OrderChannel.ONLINE,
                OrderStatus.PENDING, OrderPaymentStatus.UNPAID,
                pick(variants, 0), 2, "Giao giờ hành chính"));
        orders.add(build("SEED-0002", customer, null, OrderChannel.ONLINE,
                OrderStatus.CONFIRMED, OrderPaymentStatus.UNPAID,
                pick(variants, 1), 1, null));
        orders.add(build("SEED-0003", customer, null, OrderChannel.ONLINE,
                OrderStatus.SHIPPING, OrderPaymentStatus.UNPAID,
                pick(variants, 2), 1, "Gọi trước khi giao"));
        orders.add(build("SEED-0004", customer, null, OrderChannel.ONLINE,
                OrderStatus.DELIVERED, OrderPaymentStatus.PAID,
                pick(variants, 1), 2, null));
        orders.add(build("SEED-0005", customer, admin, OrderChannel.IN_STORE,
                OrderStatus.COMPLETED, OrderPaymentStatus.PAID,
                pick(variants, 0), 1, "Bán tại quầy"));
        orders.add(build("SEED-0006", customer, null, OrderChannel.ONLINE,
                OrderStatus.CANCELLED, OrderPaymentStatus.UNPAID,
                pick(variants, 2), 1, "Khách đổi ý"));

        adminOrderRepository.saveAll(orders);
        logger.info(">>> DemoOrderSeeder: da tao {} don demo (SEED-0001..SEED-0006).", orders.size());
        logger.info(">>> Luu y: don SEED-0001 dang PENDING se bi cleanupExpiredPendingOrders "
                + "tu huy sau 15 phut. Test nut Xac nhan/Huy som.");
    }

    // Ít biến thể hơn số đơn thì quay vòng dùng lại, không để văng IndexOutOfBounds.
    private ProductVariant pick(List<ProductVariant> variants, int index) {
        return variants.get(index % variants.size());
    }

    private Order build(String code, User customer, User staff, OrderChannel channel,
                        OrderStatus status, OrderPaymentStatus paymentStatus,
                        ProductVariant variant, int quantity, String note) {
        BigDecimal lineTotal = variant.getPrice().multiply(BigDecimal.valueOf(quantity));
        BigDecimal shippingFee = channel == OrderChannel.ONLINE ? ONLINE_SHIPPING_FEE : BigDecimal.ZERO;

        Order order = new Order();
        order.setOrderCode(code);
        order.setUser(customer);
        order.setCreatedByStaff(staff);
        order.setChannel(channel);
        order.setShippingFee(shippingFee);
        order.setSubtotal(lineTotal);
        order.setTotalAmount(lineTotal.add(shippingFee));
        order.setStatus(status);
        order.setPaymentStatus(paymentStatus);
        order.setNote(note);

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setVariant(variant);
        item.setProductName(variant.getProduct().getName());
        item.setVariantInfo(variant.getSize() + " / " + variant.getColor());
        item.setUnitPrice(variant.getPrice());
        item.setQuantity(quantity);
        item.setSubtotal(lineTotal);
        order.getItems().add(item);

        // Trừ kho đúng như đơn thật, TRỪ đơn đã huỷ.
        // Đơn huỷ coi như đã hoàn kho rồi - nếu vẫn trừ ở đây thì lát nữa bấm "Huỷ" trên
        // một đơn khác, logic hoàn kho sẽ cộng vào một con số vốn đã sai từ đầu.
        if (status != OrderStatus.CANCELLED) {
            variant.setStockQuantity(Math.max(0, variant.getStockQuantity() - quantity));
            posVariantRepository.save(variant);
        }

        return order;
    }
}
