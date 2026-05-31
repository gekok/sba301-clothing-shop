import React from 'react';
import { Card, Table, Button } from 'react-bootstrap';
import { StarFill } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { useReviewSystemDemo } from './ReviewContextDemo';

export default function OrderListDemo() {
  const { orders } = useReviewSystemDemo();
  const navigate = useNavigate();

  return (
    <Card className="border-0 shadow-sm p-4 bg-white rounded-3">
      <h6 className="fw-bold text-dark mb-4 text-uppercase tracking-wide" style={{ fontSize: '13px' }}>
        Danh Sách Đơn Hàng (Màn Hình 1 - Demo)
      </h6>
      <Table responsive hover className="align-middle mb-0 text-nowrap">
        <thead>
          <tr className="text-secondary small border-bottom" style={{ fontSize: '12px' }}>
            <th className="pb-3 fw-semibold">Mã Đơn</th>
            <th className="pb-3 fw-semibold">Tên sản phẩm</th>
            <th className="pb-3 fw-semibold">Phân loại hàng</th>
            <th className="pb-3 fw-semibold text-end">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(orders).map((item) => (
            <tr key={item.orderCode}>
              <td className="fw-medium text-dark py-3" style={{ fontSize: '13px' }}>{item.orderCode}</td>
              <td className="text-dark fw-medium" style={{ fontSize: '13px' }}>{item.productName}</td>
              <td className="text-muted" style={{ fontSize: '13px' }}>{item.variantInfo}</td>
              <td className="text-end py-2">
                {item.status === 'reviewed' ? (
                  <div className="d-inline-flex align-items-center gap-2">
                    <div className="text-warning small">
                      {[...Array(item.rating)].map((_, i) => <StarFill key={i} className="me-0.5" />)}
                    </div>
                    <Button size="sm" variant="outline-secondary" className="bg-white text-dark border px-3 py-1.5 small rounded fw-medium" 
                      onClick={() => navigate(`/demo-order/${item.orderCode}`)}>
                      Xem & Sửa Đánh Giá
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="dark" className="px-3 py-1.5 rounded fw-medium" style={{ backgroundColor: '#2b3a4a', borderColor: '#2b3a4a' }} 
                    onClick={() => navigate(`/demo-order/${item.orderCode}`)}>
                    Viết Đánh Giá
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}