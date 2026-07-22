package com.sba301.ecommerce.features.audit.controller;

import com.sba301.ecommerce.features.audit.dto.AuditLogResponse;
import com.sba301.ecommerce.features.audit.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Đường dẫn đầy đủ: /api/v1/audit-logs (context-path /api/v1 khai trong application.properties).
@RestController
@RequestMapping("/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    // required = false: FE để "Tất cả" thì không gửi tham số lên.
    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> search(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String targetType) {
        return ResponseEntity.ok(auditLogService.search(action, targetType));
    }
}
