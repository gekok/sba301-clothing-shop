package com.sba301.ecommerce.features.order.service;

import com.sba301.ecommerce.exception.BadRequestException;
import com.sba301.ecommerce.exception.ResourceNotFoundException;
import com.sba301.ecommerce.features.audit.service.AuditAction;
import com.sba301.ecommerce.features.audit.service.AuditLogService;
import com.sba301.ecommerce.features.entities.Order;
import com.sba301.ecommerce.features.entities.OrderItem;
import com.sba301.ecommerce.features.entities.ProductVariant;
import com.sba301.ecommerce.features.entities.User;
import com.sba301.ecommerce.features.entities.enums.OrderChannel;
import com.sba301.ecommerce.features.entities.enums.OrderStatus;
import com.sba301.ecommerce.features.order.dto.AdminOrderResponse;
import com.sba301.ecommerce.features.order.dto.UpdateOrderStatusRequest;
import com.sba301.ecommerce.features.order.repository.AdminOrderRepository;
import com.sba301.ecommerce.features.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminOrderServiceImpl implements AdminOrderService {

    // Luật chuyển trạng thái, kiểm tại server.
    // PHẢI đồng bộ với FE: frontend/src/shared/utils/orderStatus.js (ORDER_TRANSITIONS).
    // FE chỉ hiện nút cho đẹp; ai gọi thẳng API bằng curl vẫn phải qua bảng này (trust boundary).
    private static final Map<OrderStatus, List<OrderStatus>> ALLOWED_TRANSITIONS = Map.of(
            OrderStatus.PENDING,   List.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED, List.of(OrderStatus.SHIPPING, OrderStatus.CANCELLED),
            OrderStatus.SHIPPING,  List.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED),
            OrderStatus.DELIVERED, List.of(OrderStatus.COMPLETED),
            // 2 trạng thái kết thúc - không đi đâu được nữa.
            OrderStatus.COMPLETED, List.of(),
            OrderStatus.CANCELLED, List.of()
    );

    private final AdminOrderRepository adminOrderRepository;
    private final ProductVariantRepository productVariantRepository;
    private final AuditLogService auditLogService;
    private final AdminOrderMapper adminOrderMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AdminOrderResponse> search(OrderStatus status, OrderChannel channel, String keyword) {
        String kw = keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);

        // Lọc bằng Java sau khi lấy về, không đẩy điều kiện xuống SQL.
        // Đổi lại là kéo cả bảng orders lên: chấp nhận được ở quy mô đồ án, nhưng khi
        // số đơn lớn thì phải chuyển sang Specification + phân trang.
        return adminOrderRepository.findAllForAdmin().stream()
                .filter(order -> status == null || order.getStatus() == status)
                .filter(order -> channel == null || order.getChannel() == channel)
                .filter(order -> kw.isEmpty() || matchesKeyword(order, kw))
                .map(adminOrderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public AdminOrderResponse updateStatus(Long id, UpdateOrderStatusRequest request) {
        // 1. Tìm đơn. Không có -> 404 (khác 400: đường dẫn sai chứ không phải dữ liệu gửi lên sai).
        Order order = adminOrderRepository.findByIdForAdmin(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng id = " + id));

        OrderStatus current = order.getStatus();
        OrderStatus target = request.getStatus();

        // 2. Bấm lại đúng trạng thái đang có -> thao tác vô nghĩa, chặn sớm cho rõ ràng.
        if (current == target) {
            throw new BadRequestException("Đơn đang ở trạng thái " + current + " rồi");
        }

        // 3. Kiểm luật chuyển tại server, không tin dữ liệu client gửi lên.
        List<OrderStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, List.of());
        if (!allowed.contains(target)) {
            throw new BadRequestException("Không thể chuyển đơn từ " + current + " sang " + target);
        }

        // 4. Huỷ đơn thì phải trả hàng về kho, nếu không kho bị hụt vĩnh viễn.
        //    Cùng cách xử lý với 2 chỗ huỷ đơn có sẵn: OrderServiceImpl.handleVNPayCallback
        //    (thanh toán thất bại) và cleanupExpiredPendingOrders (đơn treo quá 15 phút).
        //    Không sợ cộng kho 2 lần: CANCELLED là trạng thái kết thúc, bước 3 chặn mọi đường ra khỏi nó.
        if (target == OrderStatus.CANCELLED) {
            restoreStock(order);
        }

        // 5. Cập nhật.
        order.setStatus(target);
        Order saved = adminOrderRepository.save(order);

        // 6. Ghi nhật ký. Nằm chung transaction với bước 5: đổi trạng thái hỏng thì
        //    nhật ký cũng biến mất, không để lại dòng log về việc chưa từng xảy ra.
        Map<String, Object> changes = new LinkedHashMap<>();
        changes.put("status", Map.of("from", current.name(), "to", target.name()));
        auditLogService.record(AuditAction.ORDER_STATUS_CHANGED, AuditAction.TARGET_ORDER, saved.getId(), changes);

        return adminOrderMapper.toResponse(saved);
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getVariant();
            variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
            productVariantRepository.save(variant);
        }
    }

    private boolean matchesKeyword(Order order, String keyword) {
        User customer = order.getUser();
        String customerName = customer == null ? null : customer.getFullName();
        // Tìm cả trong ghi chú: đơn bán tại quầy đứng tên tài khoản chung "Khách lẻ",
        // tên khách nhân viên gõ được ghi vào note (xem PosServiceImpl.buildNote).
        // Không quét note thì gõ đúng tên khách vẫn không ra đơn POS nào.
        return containsIgnoreCase(order.getOrderCode(), keyword)
                || containsIgnoreCase(customerName, keyword)
                || containsIgnoreCase(order.getNote(), keyword);
    }

    private boolean containsIgnoreCase(String value, String keyword) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(keyword);
    }
}
