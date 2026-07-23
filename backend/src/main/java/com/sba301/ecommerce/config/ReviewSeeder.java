package com.sba301.ecommerce.config;

import com.sba301.ecommerce.features.entities.Order;
import com.sba301.ecommerce.features.entities.OrderItem;
import com.sba301.ecommerce.features.entities.ProductVariant;
import com.sba301.ecommerce.features.entities.Review;
import com.sba301.ecommerce.features.entities.User;
import com.sba301.ecommerce.features.entities.enums.OrderChannel;
import com.sba301.ecommerce.features.entities.enums.OrderPaymentStatus;
import com.sba301.ecommerce.features.entities.enums.OrderStatus;
import com.sba301.ecommerce.features.order.repository.OrderRepository;
import com.sba301.ecommerce.features.pos.repository.PosVariantRepository;
import com.sba301.ecommerce.features.pos.repository.UserPosRepository;
import com.sba301.ecommerce.features.review.repository.ReviewRepository;
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
import java.util.Optional;

/**
 * Seed vài Review mẫu cho demo Create/Update/Delete + tính năng ẩn/hiện của Admin (Phase 4b).
 *
 * Vì sao cần: DatabaseSeeder/DemoOrderSeeder không seed review nào, và
 * ReviewServiceImpl.createReview bắt buộc order phải ở trạng thái DELIVERED/COMPLETED mới cho
 * review được — nên seeder này phải tự tìm (hoặc tái dùng) đúng order/orderItem đó trước khi seed
 * review (xem OVERVIEW_Review_CRUD_AdminModeration.md, Phần 5, rủi ro #8).
 *
 * Vì sao dùng ApplicationReadyEvent chứ không CommandLineRunner: cùng lý do đã ghi ở
 * DemoOrderSeeder — cần chạy SAU khi DemoOrderSeeder đã tạo xong đơn demo (SEED-0004 DELIVERED,
 * SEED-0005 COMPLETED), vì reviewer cần OrderItem đã tồn tại.
 *
 * Phase 4a (sub-phase trước) chỉ tìm 1 order hợp lệ và log xác nhận wiring — chưa seed Review nào.
 *
 * Phase 4b (sub-phase hiện tại): seed thật 3-5 Review. Lý do không thể chỉ dùng lại đúng 1 order
 * như 4a: bảng `reviews` có unique constraint (user_id, order_item_id) — mỗi review cần 1 OrderItem
 * RIÊNG. DemoOrderSeeder chỉ tạo 2 đơn DELIVERED/COMPLETED (SEED-0004, SEED-0005), mỗi đơn đúng 1
 * OrderItem => tối đa 2 OrderItem có sẵn để tái dùng, không đủ cho 3-5 review. Nên ReviewSeeder tự
 * tạo thêm tối đa 3 đơn DELIVERED riêng (mã "REVIEW-SEED-0001".."REVIEW-SEED-0003", tách biệt hẳn
 * khỏi dải mã "SEED-000x" của DemoOrderSeeder để không gây nhầm lẫn khi debug/demo màn Quản lý đơn
 * hàng), dùng lại các ProductVariant đang active (chỉ có 1 Product trong DB demo — xem
 * DatabaseSeeder — nên toàn bộ review mẫu đều thuộc về sản phẩm đó, là hành vi mong đợi).
 *
 * Đây là dữ liệu dựng cho môi trường dev, cùng vòng đời với DemoOrderSeeder — xoá class này trước
 * khi nộp/deploy thật.
 */
@Component
@RequiredArgsConstructor
public class ReviewSeeder {

    private static final Logger logger = LoggerFactory.getLogger(ReviewSeeder.class);

    // Ưu tiên SEED-0004 (DELIVERED); thử luôn cả SEED-0005 (COMPLETED) — khác 4a (dừng ở đơn đầu
    // tiên tìm được), 4b cần gom TẤT CẢ OrderItem hợp lệ có sẵn, không chỉ 1.
    private static final List<String> CANDIDATE_ORDER_CODES = List.of("SEED-0004", "SEED-0005");

    // Đơn tạo riêng cho demo review khi 2 đơn có sẵn ở trên không đủ OrderItem.
    private static final List<String> EXTRA_ORDER_CODES = List.of(
            "REVIEW-SEED-0001", "REVIEW-SEED-0002", "REVIEW-SEED-0003");

    private static final int TARGET_REVIEW_COUNT = 5;
    private static final BigDecimal ONLINE_SHIPPING_FEE = new BigDecimal("30000");

    // 5 review mẫu: rating đa dạng (2-5 sao), comment tiếng Việt, đúng 1 review isVisible=false
    // (rating 2 sao — mô phỏng tình huống admin ẩn review vì đang xử lý khiếu nại, để có sẵn data
    // demo tính năng ẩn/hiện của Admin mà không cần thao tác tay trước khi test).
    private static final List<SeedReviewData> SEED_DATA = List.of(
            new SeedReviewData(5, "Áo mặc rất thoáng mát, chất vải mềm, form chuẩn size M. "
                    + "Sẽ ủng hộ shop tiếp!", true),
            new SeedReviewData(4, "Chất lượng ổn so với giá tiền, đường may chắc chắn. "
                    + "Giao hàng hơi chậm một chút.", true),
            new SeedReviewData(3, "Áo bình thường, màu thực tế hơi khác so với hình trên web "
                    + "nhưng vẫn mặc được.", true),
            new SeedReviewData(5, "Mua tặng bạn, bạn khen đẹp và vừa vặn. Đóng gói cẩn thận, "
                    + "giao nhanh hơn dự kiến.", true),
            new SeedReviewData(2, "Áo bị xù lông sau vài lần giặt, không như mong đợi. "
                    + "(Review này đang bị ẩn để demo tính năng kiểm duyệt của Admin.)", false));

    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final UserPosRepository userPosRepository;
    private final PosVariantRepository posVariantRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seed() {
        // Chỉ gieo khi DB chưa có review nào — chạy lại app lần 2 sẽ không nhân bản dữ liệu
        // (cùng nguyên tắc idempotent như DemoOrderSeeder.seed()).
        if (reviewRepository.count() > 0) {
            logger.info(">>> ReviewSeeder: da co review trong DB, bo qua seeding (idempotent).");
            return;
        }

        List<OrderItem> orderItems = collectExistingEligibleOrderItems();

        int missing = TARGET_REVIEW_COUNT - orderItems.size();
        if (missing > 0) {
            orderItems.addAll(createExtraDeliveredOrderItems(missing));
        }

        if (orderItems.isEmpty()) {
            logger.warn(">>> ReviewSeeder: khong co OrderItem hop le nao (ke ca tu tao) de seed "
                    + "review. Bo qua (co the DatabaseSeeder chua chay truoc, chua co san pham/user).");
            return;
        }

        int reviewCount = Math.min(orderItems.size(), SEED_DATA.size());
        int hiddenCount = 0;
        List<Review> reviews = new ArrayList<>();

        for (int i = 0; i < reviewCount; i++) {
            OrderItem orderItem = orderItems.get(i);
            SeedReviewData data = SEED_DATA.get(i);

            Review review = new Review();
            review.setUser(orderItem.getOrder().getUser());
            review.setProduct(orderItem.getVariant().getProduct());
            review.setOrderItem(orderItem);
            review.setRating(data.rating());
            review.setComment(data.comment());
            review.setIsVisible(data.visible());
            reviews.add(review);

            if (!data.visible()) {
                hiddenCount++;
            }
        }

        reviewRepository.saveAll(reviews);
        logger.info(">>> ReviewSeeder: da seed {} review mau ({} bi an) cho demo Review CRUD + "
                + "Admin Moderation.", reviews.size(), hiddenCount);
    }

    // Gom OrderItem từ các đơn DELIVERED/COMPLETED mà DemoOrderSeeder đã tạo sẵn (SEED-0004,
    // SEED-0005) — tái dùng trước khi phải tự tạo thêm đơn mới.
    private List<OrderItem> collectExistingEligibleOrderItems() {
        List<OrderItem> items = new ArrayList<>();
        for (String code : CANDIDATE_ORDER_CODES) {
            Optional<Order> order = orderRepository.findByOrderCodeWithItems(code);
            if (order.isPresent()
                    && isEligibleStatus(order.get().getStatus())
                    && !order.get().getItems().isEmpty()) {
                items.add(order.get().getItems().get(0));
            }
        }
        return items;
    }

    // Tự tạo tối đa `count` đơn DELIVERED riêng cho demo review, dùng lại ProductVariant đang
    // active. Mỗi đơn 1 OrderItem — đủ để mỗi review có 1 OrderItem riêng, không vi phạm unique
    // constraint (user_id, order_item_id).
    private List<OrderItem> createExtraDeliveredOrderItems(int count) {
        User customer = userPosRepository.findUserByEmail("customer@sba301.local");
        List<ProductVariant> variants = posVariantRepository.findActiveWithProduct();

        if (customer == null || variants.isEmpty()) {
            logger.warn(">>> ReviewSeeder: khong tim thay user customer@sba301.local hoac chua co "
                    + "ProductVariant active nao, khong the tu tao don de seed du review.");
            return List.of();
        }

        List<Order> extraOrders = new ArrayList<>();
        for (int i = 0; i < count && i < EXTRA_ORDER_CODES.size(); i++) {
            String code = EXTRA_ORDER_CODES.get(i);

            // Phòng trường hợp chạy lại 1 phần (VD app crash giữa chừng) — không tạo trùng mã đơn.
            if (orderRepository.findByOrderCode(code).isPresent()) {
                continue;
            }

            ProductVariant variant = variants.get(i % variants.size());
            extraOrders.add(buildDeliveredOrder(code, customer, variant));
        }

        if (extraOrders.isEmpty()) {
            return List.of();
        }

        List<Order> saved = orderRepository.saveAll(extraOrders);
        List<OrderItem> items = new ArrayList<>();
        for (Order order : saved) {
            items.add(order.getItems().get(0));
        }
        return items;
    }

    private Order buildDeliveredOrder(String orderCode, User customer, ProductVariant variant) {
        int quantity = 1;
        BigDecimal lineTotal = variant.getPrice().multiply(BigDecimal.valueOf(quantity));

        Order order = new Order();
        order.setOrderCode(orderCode);
        order.setUser(customer);
        order.setChannel(OrderChannel.ONLINE);
        order.setShippingFee(ONLINE_SHIPPING_FEE);
        order.setSubtotal(lineTotal);
        order.setTotalAmount(lineTotal.add(ONLINE_SHIPPING_FEE));
        order.setStatus(OrderStatus.DELIVERED);
        order.setPaymentStatus(OrderPaymentStatus.PAID);
        order.setNote("Don seed rieng cho demo Review (Phase 4b) - khong phai don that.");

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setVariant(variant);
        item.setProductName(variant.getProduct().getName());
        item.setVariantInfo(variant.getSize() + " / " + variant.getColor());
        item.setUnitPrice(variant.getPrice());
        item.setQuantity(quantity);
        item.setSubtotal(lineTotal);
        order.getItems().add(item);

        // Trừ kho giống DemoOrderSeeder, giữ dữ liệu demo nhất quán (không bắt buộc cho tính năng
        // Review, nhưng tránh số tồn kho ảo lệch với số đơn đã "giao" trong demo).
        variant.setStockQuantity(Math.max(0, variant.getStockQuantity() - quantity));
        posVariantRepository.save(variant);

        return order;
    }

    private boolean isEligibleStatus(OrderStatus status) {
        return status == OrderStatus.DELIVERED || status == OrderStatus.COMPLETED;
    }

    private record SeedReviewData(int rating, String comment, boolean visible) {
    }
}
