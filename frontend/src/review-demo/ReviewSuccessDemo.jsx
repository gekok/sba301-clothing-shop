import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import { CheckCircleFill, StarFill, ArrowRight } from 'react-bootstrap-icons';
import { useReviewSystemDemo } from './ReviewContextDemo';

export default function ReviewSuccessDemo() {
  const { orderCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { orders } = useReviewSystemDemo();

  const currentOrder = orders[orderCode];
  const rating = location.state?.rating || 5;
  const comment = location.state?.comment || "";

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }} className="py-4">
      <Card className="border-0 text-center p-4 p-md-5 rounded-3 shadow-sm bg-white mb-4">
        <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10" style={{ width: '56px', height: '56px' }}>
          <CheckCircleFill size={28} className="text-success" />
        </div>
        <h5 className="fw-bold mb-2 text-dark">Gửi Đánh Giá Thành Công (Màn 3)</h5>
        <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: '420px' }}>Ý kiến phản hồi chân thực của bạn đóng vai trò vô cùng quan trọng đối với cộng đồng mua sắm.</p>
        
        <div className="mx-auto w-100" style={{ maxWidth: '280px' }}>
          <Button variant="dark" className="w-100 fw-semibold py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: '#2b3a4a', border:'none' }}
            onClick={() => navigate(`/demo-product/${currentOrder?.productId || 'PROD-DEMO'}`)}>
            📦 Xem Review Toàn Sàn <ArrowRight size={16}/>
          </Button>
        </div>
      </Card>

      <Card className="border-0 p-4 rounded-3 shadow-sm bg-white border-top border-4" style={{ borderTopColor: '#2b3a4a' }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <span className="text-muted fw-bold tracking-wider" style={{ fontSize: '11px' }}>DỮ LIỆU BẠN VỪA GỬI LÊN HỆ THỐNG</span>
          <div className="text-warning small">
            {[...Array(rating)].map((_, i) => <StarFill key={i} className="text-warning" size={14} />)}
          </div>
        </div>
        <p className="p-3 rounded bg-light text-dark mb-0 fs-6 fw-medium">{comment}</p>
      </Card>
    </div>
  );
}