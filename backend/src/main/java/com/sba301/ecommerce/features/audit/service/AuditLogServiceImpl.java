package com.sba301.ecommerce.features.audit.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sba301.ecommerce.features.audit.dto.AuditLogResponse;
import com.sba301.ecommerce.features.audit.repository.AuditLogRepository;
import com.sba301.ecommerce.features.entities.AuditLog;
import com.sba301.ecommerce.features.entities.User;
import com.sba301.ecommerce.security.user.CurrentUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    // Giới hạn số dòng trả về. Nhật ký chỉ có thêm chứ không bớt, để không giới hạn
    // thì vài tháng nữa 1 request kéo cả chục nghìn dòng về trình duyệt.
    private static final int MAX_RECORDS = 200;

    // Trần tự đặt cho chuỗi changes. Cột trong db.sql là NVARCHAR(MAX) nên không phải
    // để tránh lỗi INSERT, mà để 1 payload bất thường không phình bảng nhật ký.
    // Với dữ liệu hiện tại (vài field từ/sang) thì không bao giờ chạm tới.
    private static final int MAX_CHANGES_LENGTH = 4000;

    private final AuditLogRepository auditLogRepository;
    private final CurrentUserProvider currentUserProvider;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void record(String action, String targetType, Long targetId, Map<String, Object> changes) {
        AuditLog log = new AuditLog();
        log.setActor(resolveActor());
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setChanges(toJson(changes));
        auditLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> search(String action, String targetType) {
        // null/rỗng -> chuỗi rỗng = dấu hiệu "không lọc theo tiêu chí này" (xem AuditLogRepository).
        return auditLogRepository.searchRecentWithActor(
                        blankIfNull(action), blankIfNull(targetType), PageRequest.of(0, MAX_RECORDS))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private String blankIfNull(String value) {
        return value == null ? "" : value.trim();
    }

    // Ai đang thao tác. Null khi không xác định được: AuditLog.actor cho phép null,
    // và không đáng để việc ghi nhật ký làm hỏng nghiệp vụ chính.
    private User resolveActor() {
        return currentUserProvider.getCurrentUser().orElse(null);
    }

    private String toJson(Map<String, Object> changes) {
        if (changes == null || changes.isEmpty()) {
            return null;
        }
        try {
            String json = objectMapper.writeValueAsString(changes);
            return json.length() > MAX_CHANGES_LENGTH ? json.substring(0, MAX_CHANGES_LENGTH) : json;
        } catch (JsonProcessingException e) {
            // Không ném tiếp: nhật ký hỏng định dạng vẫn hơn là làm hỏng việc đổi trạng thái đơn.
            return null;
        }
    }

    private AuditLogResponse toResponse(AuditLog log) {
        User actor = log.getActor();
        return AuditLogResponse.builder()
                .id(log.getId())
                .actorName(actor != null ? actor.getFullName() : null)
                .action(log.getAction())
                .targetType(log.getTargetType())
                .targetId(log.getTargetId())
                .changes(log.getChanges())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
