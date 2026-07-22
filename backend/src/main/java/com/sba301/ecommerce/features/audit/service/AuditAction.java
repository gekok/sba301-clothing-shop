package com.sba301.ecommerce.features.audit.service;

// Tên hành động + loại đối tượng dùng chung cho mọi chỗ ghi nhật ký.
// Để hằng số ở đây thay vì gõ chuỗi rời trong từng service: gõ tay dễ sai chính tả,
// mà sai 1 ký tự thì bộ lọc theo action ở FE lặng lẽ sót dòng đó.
public final class AuditAction {

    private AuditAction() {
    }

    // Hành động
    public static final String ORDER_STATUS_CHANGED = "ORDER_STATUS_CHANGED";
    public static final String POS_ORDER_CREATED = "POS_ORDER_CREATED";

    // Loại đối tượng bị tác động
    public static final String TARGET_ORDER = "ORDER";
}
