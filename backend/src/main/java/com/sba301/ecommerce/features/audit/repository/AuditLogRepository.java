package com.sba301.ecommerce.features.audit.repository;

import com.sba301.ecommerce.features.entities.AuditLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // LEFT JOIN FETCH actor: lấy luôn người thao tác trong 1 câu SQL.
    // Nếu không fetch sẵn -> mỗi dòng log lại bắn thêm 1 query lấy User (lỗi N+1),
    // và vì open-in-view=false nên ra ngoài transaction là LazyInitializationException.
    // LEFT (không phải INNER) vì actor được phép null - việc do hệ thống tự chạy không có người thao tác.
    // Điều kiện lọc phải nằm TRONG câu SQL, không được lọc bằng Java sau khi lấy về:
    // đã giới hạn 200 dòng mới nhất mà lọc sau thì chọn "Tạo đơn tại quầy" trong ngày
    // có 200+ dòng đổi trạng thái sẽ ra bảng rỗng, dù dữ liệu vẫn còn ở dưới.
    //
    // Dùng chuỗi rỗng làm dấu hiệu "không lọc" thay vì null: tham số luôn có kiểu String
    // rõ ràng nên Hibernate không phải đoán kiểu của null.
    @Query("SELECT a FROM AuditLog a LEFT JOIN FETCH a.actor "
            + "WHERE (:action = '' OR a.action = :action) "
            + "AND (:targetType = '' OR a.targetType = :targetType) "
            + "ORDER BY a.createdAt DESC")
    List<AuditLog> searchRecentWithActor(@Param("action") String action,
                                         @Param("targetType") String targetType,
                                         Pageable pageable);
}
