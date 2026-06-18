// src/mock/auditLogs.js
// Nhật ký thao tác giả. Bám entity AuditLog: actor, action, targetType, targetId, changes, createdAt.
// - actor (object User) -> rút gọn thành actorName.
// - changes: chuỗi JSON (đúng như cột 'changes' length 4000 trong entity).

export const MOCK_AUDIT_LOGS = [
  {
    id: 1,
    actorName: 'Admin Trung',
    action: 'ORDER_CONFIRMED',
    targetType: 'ORDER',
    targetId: 2,
    changes: '{"status":{"from":"PENDING","to":"CONFIRMED"}}',
    createdAt: '2026-05-29T15:10:00',
  },
  {
    id: 2,
    actorName: 'Admin Trung',
    action: 'ORDER_SHIPPED',
    targetType: 'ORDER',
    targetId: 3,
    changes: '{"status":{"from":"CONFIRMED","to":"SHIPPING"}}',
    createdAt: '2026-05-30T09:00:00',
  },
  {
    id: 3,
    actorName: 'Staff Hồng',
    action: 'POS_ORDER_CREATED',
    targetType: 'ORDER',
    targetId: 5,
    changes: '{"channel":"IN_STORE","total":175000,"paymentStatus":"PAID"}',
    createdAt: '2026-05-30T11:05:00',
  },
  {
    id: 4,
    actorName: 'Admin Trung',
    action: 'ORDER_CANCELLED',
    targetType: 'ORDER',
    targetId: 6,
    changes: '{"status":{"from":"PENDING","to":"CANCELLED"},"reason":"Khách đổi ý"}',
    createdAt: '2026-05-26T10:30:00',
  },
  {
    id: 5,
    actorName: 'Admin Trung',
    action: 'PRODUCT_UPDATED',
    targetType: 'PRODUCT',
    targetId: 1,
    changes: '{"price":{"from":170000,"to":175000}}',
    createdAt: '2026-05-25T13:45:00',
  },
  {
    id: 6,
    actorName: 'Staff Hồng',
    action: 'ORDER_DELIVERED',
    targetType: 'ORDER',
    targetId: 4,
    changes: '{"status":{"from":"SHIPPING","to":"DELIVERED"},"paymentStatus":"PAID"}',
    createdAt: '2026-05-27T16:25:00',
  },
];
