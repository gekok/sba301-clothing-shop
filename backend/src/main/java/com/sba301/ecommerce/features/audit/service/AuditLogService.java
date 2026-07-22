package com.sba301.ecommerce.features.audit.service;

import com.sba301.ecommerce.features.audit.dto.AuditLogResponse;

import java.util.List;
import java.util.Map;

public interface AuditLogService {

    // Ghi 1 dòng nhật ký. Gọi từ trong transaction của nghiệp vụ gốc
    // -> nghiệp vụ rollback thì nhật ký cũng rollback theo, không có log "ma".
    void record(String action, String targetType, Long targetId, Map<String, Object> changes);

    // action/targetType để null = không lọc theo tiêu chí đó.
    List<AuditLogResponse> search(String action, String targetType);
}
