// src/components/StatusBadge.jsx
// Badge màu dùng chung cho TRẠNG THÁI ĐƠN và TRẠNG THÁI THANH TOÁN.
// Tra nhãn + màu từ các map trong utils/orderStatus -> không hard-code ở mỗi page.
import { Badge } from 'react-bootstrap';
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_VARIANT,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_VARIANT,
} from '../utils/orderStatus';

// Props:
// - status: chuỗi enum (vd 'PENDING', 'PAID')
// - type: 'order' (mặc định) | 'payment' -> quyết định tra map nào
export default function StatusBadge({ status, type = 'order' }) {
  const isOrder = type === 'order';
  const label = isOrder ? ORDER_STATUS_LABEL[status] : PAYMENT_STATUS_LABEL[status];
  const variant = isOrder ? ORDER_STATUS_VARIANT[status] : PAYMENT_STATUS_VARIANT[status];

  // Fallback an toàn nếu gặp status lạ: màu xám + hiện nguyên chuỗi.
  return <Badge bg={variant ?? 'secondary'}>{label ?? status}</Badge>;
}
