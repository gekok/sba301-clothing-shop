// src/pages/admin/AuditLogs.jsx
// UI 3 — Nhật ký thao tác: bảng log + lọc theo action/targetType + hiện 'changes' dạng đẹp.
import { useMemo, useState } from 'react';
import { Table, Form, Row, Col, Badge } from 'react-bootstrap';

import { MOCK_AUDIT_LOGS } from '../../mock/auditLogs';
import { formatDateTime } from '../../utils/format';

// Lấy danh sách action + targetType DUY NHẤT để đổ vào ô lọc (new Set loại trùng).
const ACTIONS = [...new Set(MOCK_AUDIT_LOGS.map((l) => l.action))];
const TARGET_TYPES = [...new Set(MOCK_AUDIT_LOGS.map((l) => l.targetType))];

// Parse chuỗi JSON 'changes' -> hiện gọn dạng "field: from → to".
// try/catch: nếu chuỗi không phải JSON hợp lệ -> trả nguyên chuỗi, không làm vỡ UI.
function renderChanges(changesStr) {
  try {
    const obj = JSON.parse(changesStr);
    return Object.entries(obj)
      .map(([field, val]) => {
        if (val && typeof val === 'object' && 'from' in val && 'to' in val) {
          return `${field}: ${val.from} → ${val.to}`;
        }
        return `${field}: ${JSON.stringify(val)}`;
      })
      .join('; ');
  } catch {
    return changesStr;
  }
}

function AuditLogs() {
  const [actionFilter, setActionFilter] = useState('ALL');
  const [targetFilter, setTargetFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter((l) => {
      const matchAction = actionFilter === 'ALL' || l.action === actionFilter;
      const matchTarget = targetFilter === 'ALL' || l.targetType === targetFilter;
      return matchAction && matchTarget;
    });
  }, [actionFilter, targetFilter]);

  return (
    <>
      <h1 className="mb-4">Nhật ký thao tác</h1>

      <Row className="g-2 mb-3">
        <Col xs={12} md={4}>
          <Form.Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="ALL">Tất cả hành động</option>
            {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </Form.Select>
        </Col>
        <Col xs={12} md={4}>
          <Form.Select value={targetFilter} onChange={(e) => setTargetFilter(e.target.value)}>
            <option value="ALL">Tất cả đối tượng</option>
            {TARGET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Form.Select>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Người thao tác</th>
            <th>Hành động</th>
            <th>Đối tượng</th>
            <th>Thay đổi</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((l) => (
            <tr key={l.id}>
              <td>{formatDateTime(l.createdAt)}</td>
              <td>{l.actorName}</td>
              <td><Badge bg="info">{l.action}</Badge></td>
              <td>{l.targetType}#{l.targetId}</td>
              <td className="small">{renderChanges(l.changes)}</td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted py-4">Không có log nào.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}

export default AuditLogs;
