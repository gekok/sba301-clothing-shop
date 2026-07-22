package com.sba301.ecommerce.features.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

// Shape phải khớp bảng ở FE: features/audit-logs/pages/AuditLogs.jsx
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private String actorName;   // null nếu do hệ thống tự chạy
    private String action;
    private String targetType;
    private Long targetId;
    private String changes;     // chuỗi JSON, FE tự parse để hiện "từ -> sang"
    private LocalDateTime createdAt;
}
