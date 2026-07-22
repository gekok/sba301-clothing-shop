package com.sba301.ecommerce.features.pos.service;

import com.sba301.ecommerce.exception.BadRequestException;
import com.sba301.ecommerce.features.audit.service.AuditAction;
import com.sba301.ecommerce.features.audit.service.AuditLogService;
import com.sba301.ecommerce.features.auth.repositories.UserRepository;
import com.sba301.ecommerce.features.entities.Order;
import com.sba301.ecommerce.features.entities.OrderItem;
import com.sba301.ecommerce.features.entities.Payment;
import com.sba301.ecommerce.features.entities.ProductVariant;
import com.sba301.ecommerce.features.entities.User;
import com.sba301.ecommerce.features.entities.enums.OrderChannel;
import com.sba301.ecommerce.features.entities.enums.OrderPaymentStatus;
import com.sba301.ecommerce.features.entities.enums.OrderStatus;
import com.sba301.ecommerce.features.entities.enums.PaymentMethod;
import com.sba301.ecommerce.features.entities.enums.PaymentTxnStatus;
import com.sba301.ecommerce.features.entities.enums.Role;
import com.sba301.ecommerce.features.order.dto.AdminOrderResponse;
import com.sba301.ecommerce.features.order.repository.AdminOrderRepository;
import com.sba301.ecommerce.features.order.service.AdminOrderMapper;
import com.sba301.ecommerce.features.pos.dto.CreatePosOrderRequest;
import com.sba301.ecommerce.features.pos.dto.PosVariantResponse;
import com.sba301.ecommerce.features.pos.repository.PosVariantRepository;
import com.sba301.ecommerce.security.user.CurrentUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PosServiceImpl implements PosService {

    // Đơn bán tại quầy không gắn với tài khoản khách nào, nhưng Order.user lại NOT NULL.
    // Cách xử lý này đúng ý người thiết kế entity - xem chú thích ở Order.java:32.
    private static final String WALK_IN_EMAIL = "walkin@sba301.local";
    private static final String WALK_IN_NAME = "Khách lẻ";

    // Order.note khai length = 500, dài hơn là INSERT văng lỗi.
    private static final int MAX_NOTE_LENGTH = 500;

    private final PosVariantRepository posVariantRepository;
    private final AdminOrderRepository adminOrderRepository;
    private final UserRepository userRepository;
    private final AdminOrderMapper adminOrderMapper;
    private final AuditLogService auditLogService;
    private final CurrentUserProvider currentUserProvider;

    @Override
    @Transactional(readOnly = true)
    public List<PosVariantResponse> searchVariants(String keyword) {
        String kw = keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);
        return posVariantRepository.findActiveWithProduct().stream()
                .filter(variant -> kw.isEmpty() || matchesKeyword(variant, kw))
                .map(this::toVariantResponse)
                .toList();
    }

    @Override
    @Transactional
    public AdminOrderResponse createOrder(CreatePosOrderRequest request) {
        // 1. Gộp các dòng trùng biến thể trước khi xử lý.
        //    Nếu không gộp mà client lỡ gửi 2 dòng cùng variantId, kho bị trừ 2 lần
        //    và hoá đơn in ra 2 dòng giống nhau.
        Map<Long, Integer> quantityByVariant = mergeItems(request.getItems());

        Order order = new Order();
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        // 2. Duyệt từng biến thể: kiểm tồn kho rồi trừ kho.
        for (Map.Entry<Long, Integer> entry : quantityByVariant.entrySet()) {
            Long variantId = entry.getKey();
            Integer quantity = entry.getValue();

            ProductVariant variant = posVariantRepository.findByIdWithProduct(variantId)
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy sản phẩm có variantId = " + variantId));

            String variantInfo = variant.getSize() + " / " + variant.getColor();

            if (Boolean.FALSE.equals(variant.getIsActive())) {
                throw new BadRequestException("Sản phẩm " + variant.getProduct().getName()
                        + " (" + variantInfo + ") đã ngừng bán");
            }
            if (variant.getStockQuantity() < quantity) {
                throw new BadRequestException("Sản phẩm " + variant.getProduct().getName()
                        + " (" + variantInfo + ") chỉ còn " + variant.getStockQuantity() + " sản phẩm");
            }

            variant.setStockQuantity(variant.getStockQuantity() - quantity);
            posVariantRepository.save(variant);

            // Chép cứng tên/giá vào dòng hàng. Sau này sản phẩm đổi giá hay đổi tên thì
            // hoá đơn cũ vẫn giữ nguyên giá trị lúc bán.
            BigDecimal lineTotal = variant.getPrice().multiply(BigDecimal.valueOf(quantity));
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setVariant(variant);
            item.setProductName(variant.getProduct().getName());
            item.setVariantInfo(variantInfo);
            item.setUnitPrice(variant.getPrice());
            item.setQuantity(quantity);
            item.setSubtotal(lineTotal);
            orderItems.add(item);

            subtotal = subtotal.add(lineTotal);
        }

        // 3. Dựng đơn. Mua tại quầy nên không có phí ship.
        User staff = currentUserProvider.getCurrentUser().orElse(null);
        order.setOrderCode(generateOrderCode());
        order.setUser(getOrCreateWalkInCustomer());
        order.setCreatedByStaff(staff);
        order.setChannel(OrderChannel.IN_STORE);
        order.setShippingAddress(null);
        order.setShippingFee(BigDecimal.ZERO);
        order.setSubtotal(subtotal);
        order.setTotalAmount(subtotal);
        order.setNote(buildNote(request.getCustomerName(), request.getNote()));
        order.setItems(orderItems);

        // Khách trả tiền và cầm hàng về ngay tại quầy -> đơn kết thúc luôn, đã thanh toán.
        // Đây cũng là lý do KHÔNG để PENDING: OrderServiceImpl.cleanupExpiredPendingOrders
        // chạy mỗi phút và tự huỷ mọi đơn PENDING quá 15 phút - đơn POS sẽ bị huỷ oan.
        order.setStatus(OrderStatus.COMPLETED);
        order.setPaymentStatus(OrderPaymentStatus.PAID);

        Order saved = adminOrderRepository.save(order);

        // 4. Ghi nhận giao dịch thanh toán.
        PaymentMethod method = request.getPaymentMethod() == null
                ? PaymentMethod.CASH
                : request.getPaymentMethod();
        Payment payment = new Payment();
        payment.setOrder(saved);
        payment.setMethod(method);
        payment.setAmount(saved.getTotalAmount());
        payment.setStatus(PaymentTxnStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        saved.getPayments().add(payment);
        saved = adminOrderRepository.save(saved);

        // 5. Ghi nhật ký: ai bán, đơn nào, bao nhiêu tiền.
        Map<String, Object> changes = new LinkedHashMap<>();
        changes.put("orderCode", saved.getOrderCode());
        changes.put("itemCount", orderItems.size());
        changes.put("totalAmount", saved.getTotalAmount());
        changes.put("paymentMethod", method.name());
        auditLogService.record(AuditAction.POS_ORDER_CREATED, AuditAction.TARGET_ORDER, saved.getId(), changes);

        return adminOrderMapper.toResponse(saved);
    }

    // LinkedHashMap để giữ nguyên thứ tự nhân viên bấm thêm hàng, hoá đơn in ra dễ đối chiếu.
    //
    // Cộng dồn bằng long chứ KHÔNG phải int: @Max chỉ chặn từng dòng, client vẫn có thể
    // gửi nhiều dòng cùng variantId để tổng vượt trần. Cộng bằng int thì tổng tràn thành
    // số âm, lọt qua chốt kiểm tồn kho ở dưới rồi cộng khống kho + sinh đơn tiền âm.
    // Cộng bằng long thì không tràn nổi, và tổng được kiểm lại ngay sau đây.
    private Map<Long, Integer> mergeItems(List<CreatePosOrderRequest.Item> items) {
        Map<Long, Long> totals = new LinkedHashMap<>();
        for (CreatePosOrderRequest.Item item : items) {
            totals.merge(item.getVariantId(), item.getQuantity().longValue(), Long::sum);
        }

        Map<Long, Integer> merged = new LinkedHashMap<>();
        for (Map.Entry<Long, Long> entry : totals.entrySet()) {
            long total = entry.getValue();
            if (total < 1 || total > CreatePosOrderRequest.MAX_QUANTITY_PER_LINE) {
                throw new BadRequestException("Số lượng cho variantId = " + entry.getKey()
                        + " không hợp lệ (chỉ nhận 1 đến " + CreatePosOrderRequest.MAX_QUANTITY_PER_LINE + ")");
            }
            merged.put(entry.getKey(), (int) total);
        }
        return merged;
    }

    // Dùng chung 1 tài khoản "Khách lẻ" cho mọi đơn tại quầy, thay vì đẻ 1 user rỗng mỗi lần bán.
    private User getOrCreateWalkInCustomer() {
        User existing = userRepository.findUserByEmail(WALK_IN_EMAIL);
        if (existing != null) {
            return existing;
        }
        User walkIn = new User();
        walkIn.setEmail(WALK_IN_EMAIL);
        walkIn.setFullName(WALK_IN_NAME);
        walkIn.setRole(Role.CUSTOMER);
        // KHÔNG để "ACTIVE": đây là tài khoản kỹ thuật, không đặt mật khẩu, không ai
        // đăng nhập bằng nó. Để ACTIVE là để hở sẵn 1 tài khoản không mật khẩu cho
        // luồng đăng nhập sau này (CustomUserDetails.isEnabled đọc field này).
        walkIn.setStatus("SYSTEM");
        walkIn.setEmailVerified(false);
        walkIn.setFailedLoginAttempts(0);
        // Không đặt passwordHash: đây là tài khoản kỹ thuật, không ai đăng nhập bằng nó.
        return userRepository.save(walkIn);
    }

    // Order không có cột riêng cho tên khách vãng lai (khách thật thì đọc từ user.fullName),
    // nên tên nhân viên gõ ở quầy được ghép vào note.
    private String buildNote(String customerName, String note) {
        StringBuilder builder = new StringBuilder();
        if (customerName != null && !customerName.isBlank()) {
            builder.append("Khách: ").append(customerName.trim());
        }
        if (note != null && !note.isBlank()) {
            if (builder.length() > 0) {
                builder.append(" - ");
            }
            builder.append(note.trim());
        }
        if (builder.length() == 0) {
            return null;
        }
        String result = builder.toString();
        return result.length() > MAX_NOTE_LENGTH ? result.substring(0, MAX_NOTE_LENGTH) : result;
    }

    // Cùng cách sinh mã với đơn online (OrderServiceImpl), đổi tiền tố để nhìn là biết đơn tại quầy.
    // 4 + 15 = 19 ký tự, vừa trong giới hạn 30 của cột order_code.
    private String generateOrderCode() {
        String random = UUID.randomUUID().toString().replace("-", "").substring(0, 15).toUpperCase(Locale.ROOT);
        return "POS-" + random;
    }

    private boolean matchesKeyword(ProductVariant variant, String keyword) {
        return variant.getProduct().getName().toLowerCase(Locale.ROOT).contains(keyword)
                || variant.getSku().toLowerCase(Locale.ROOT).contains(keyword)
                || variant.getSize().toLowerCase(Locale.ROOT).contains(keyword)
                || variant.getColor().toLowerCase(Locale.ROOT).contains(keyword);
    }

    private PosVariantResponse toVariantResponse(ProductVariant variant) {
        return PosVariantResponse.builder()
                .id(variant.getId())
                .sku(variant.getSku())
                .productName(variant.getProduct().getName())
                .size(variant.getSize())
                .color(variant.getColor())
                .price(variant.getPrice())
                .stockQuantity(variant.getStockQuantity())
                .build();
    }
}
