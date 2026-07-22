// src/features/audit-logs/pages/AuditLogs.jsx
// UI 3 — Nhật ký thao tác: bảng log + lọc theo action/targetType + hiện 'changes' dạng đẹp.
// Dữ liệu thật từ backend: GET /audit-logs.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Table, Form, Row, Col, Badge, Alert, Spinner, Container } from 'react-bootstrap';

import { getAuditLogs } from '../services/auditLogService.js';
import { formatDateTime } from '../../../shared/utils/format';
import { readApiError } from '../../../shared/utils/apiError.js';

// Danh sách để đổ vào ô lọc. PHẢI đồng bộ với hằng số trong
// backend .../features/audit/service/AuditAction.java.
// Cố định ở đây thay vì suy ra từ dữ liệu đang hiển thị, vì nếu suy ra thì chọn 1 bộ lọc
// xong danh sách lựa chọn sẽ teo lại theo, không quay về được lựa chọn cũ.
const ACTION_OPTIONS = [
  { value: 'ORDER_STATUS_CHANGED', label: 'Đổi trạng thái đơn' },
  { value: 'POS_ORDER_CREATED', label: 'Tạo đơn tại quầy' },
];
const TARGET_TYPE_OPTIONS = [
  { value: 'ORDER', label: 'Đơn hàng' },
];

// Tra nhãn tiếng Việt cho cột "Hành động". Không có bảng tra này thì ô lọc ghi
// "Đổi trạng thái đơn" trong khi dòng dữ liệu ghi ORDER_STATUS_CHANGED - cùng 1 thứ
// mà hiện 2 kiểu. Gặp action lạ (thêm sau này) thì hiện nguyên mã, không để trống.
const ACTION_LABEL = Object.fromEntries(ACTION_OPTIONS.map((a) => [a.value, a.label]));

// Parse chuỗi JSON 'changes' -> hiện gọn dạng "field: from → to".
// try/catch: nếu chuỗi không phải JSON hợp lệ -> trả nguyên chuỗi, không làm vỡ UI.
function renderChanges(changesStr) {
  if (!changesStr) return '—';
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
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [actionFilter, setActionFilter] = useState('ALL');
  const [targetFilter, setTargetFilter] = useState('ALL');

  // Đổi bộ lọc liên tiếp -> nhiều request cùng bay; request cũ về sau sẽ ghi đè kết quả
  // mới. Đánh số để chỉ nhận kết quả của lần gọi mới nhất.
  const latestRequestRef = useRef(0);

  const loadLogs = useCallback(async () => {
    const requestId = ++latestRequestRef.current;
    try {
      setLoading(true);
      const data = await getAuditLogs({ action: actionFilter, targetType: targetFilter });
      if (requestId !== latestRequestRef.current) return;
      setLogs(data);
      setError('');
    } catch (err) {
      if (requestId !== latestRequestRef.current) return;
      setError(readApiError(err, 'Không tải được nhật ký thao tác.'));
    } finally {
      if (requestId === latestRequestRef.current) setLoading(false);
    }
  }, [actionFilter, targetFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <Container className="py-4">
      <h1 className="mb-4">Nhật ký thao tác</h1>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Row className="g-2 mb-3">
        <Col xs={12} md={4}>
          <Form.Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="ALL">Tất cả hành động</option>
            {ACTION_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </Form.Select>
        </Col>
        <Col xs={12} md={4}>
          <Form.Select value={targetFilter} onChange={(e) => setTargetFilter(e.target.value)}>
            <option value="ALL">Tất cả đối tượng</option>
            {TARGET_TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
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
          {logs.map((l) => (
            <tr key={l.id}>
              <td>{formatDateTime(l.createdAt)}</td>
              {/* actorName null = việc do hệ thống tự chạy, không phải người bấm */}
              <td>{l.actorName ?? <span className="text-muted">Hệ thống</span>}</td>
              <td><Badge bg="info">{ACTION_LABEL[l.action] ?? l.action}</Badge></td>
              <td>{l.targetType}#{l.targetId}</td>
              <td className="small">{renderChanges(l.changes)}</td>
            </tr>
          ))}
          {loading && (
            <tr>
              <td colSpan={5} className="text-center py-4">
                <Spinner animation="border" size="sm" /> Đang tải...
              </td>
            </tr>
          )}
          {!loading && logs.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted py-4">Không có log nào.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default AuditLogs;
