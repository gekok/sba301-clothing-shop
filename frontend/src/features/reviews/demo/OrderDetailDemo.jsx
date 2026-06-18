import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { ArrowLeft, StarFill, PencilSquare, BagCheck } from 'react-bootstrap-icons';
import { useReviewSystemDemo } from './ReviewContextDemo';

export default function OrderDetailDemo() {
  const { orderCode } = useParams();
  const navigate = useNavigate();
  const { orders, products, currentUser, reviews, addReview, updateReviewByOrder } = useReviewSystemDemo();

  const currentOrder = orders[orderCode];
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('Sản phẩm thử nghiệm chất lượng tuyệt vời, đóng gói cẩn thận!');

  const [isEditing, setIsEditing] = useState(false);
  const [editComment, setEditComment] = useState('');

  if (!currentOrder) return <div className="text-center py-5 text-muted small">Dữ liệu đơn hàng demo không tồn tại.</div>;
  const targetProduct = products[currentOrder.productId];

  const handleCreateReview = (e) => {
    e.preventDefault();
    if (comment.trim().length === 0) return;

    addReview({
      id: Date.now(),
      productId: targetProduct.id,
      user: { fullName: currentUser.fullName },
      rating: rating,
      comment: comment.trim(),
      variantInfo: currentOrder.variantInfo,
      createdAt: new Date().toISOString()
    }, orderCode);

    // Điều hướng hẳn qua Màn hình 3 độc lập
    navigate(`/demo-order/${orderCode}/success`, { state: { rating, comment } });
  };

  const handleSaveEdit = () => {
    if (editComment.trim().length === 0) return;
    updateReviewByOrder(targetProduct.id, currentOrder.variantInfo, editComment.trim());
    setIsEditing(false);
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }} className="py-2">
      <Link to="/demo" className="text-decoration-none small text-secondary d-inline-flex align-items-center gap-1 mb-4 fw-medium">
        <ArrowLeft size={14}/> Quay lại danh sách đơn hàng demo
      </Link>

      <Card className="border-0 shadow-sm p-4 mb-4 bg-white rounded-3">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 rounded bg-light"><BagCheck size={18} className="text-secondary" /></div>
            <div>
              <span className="text-muted d-block" style={{ fontSize: '11px' }}>MÃ ĐƠN HÀNG TEST</span>
              <strong className="text-dark">{currentOrder.orderCode}</strong>
            </div>
          </div>
          <span className="badge fw-semibold px-3 py-2 rounded-pill bg-success bg-opacity-10 text-success" style={{ fontSize: '12px' }}>● Đã Giao Hàng</span>
        </div>
        <div>
          <h6 className="fw-bold text-dark mb-2">{targetProduct?.name}</h6>
          <div className="d-inline-block px-2 py-1 rounded bg-light text-secondary fw-semibold" style={{ fontSize: '11px' }}>Phân loại: {currentOrder.variantInfo}</div>
        </div>
      </Card>

      {/* CHƯA ĐÁNH GIÁ -> HIỂN THỊ CƠ CHẾ GỬI FORM */}
      {!currentOrder.isReviewed && (
        <div>
          {!showForm ? (
            <Row className="g-3">
              <Col xs={12} sm={6}>
                <Button variant="dark" className="w-100 fw-bold py-2.5 rounded-3" style={{ backgroundColor: '#2b3a4a', border: 'none' }} onClick={() => setShowForm(true)}>✍️ Viết Đánh Giá</Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button variant="outline-dark" className="w-100 fw-semibold py-2.5 rounded-3 bg-white" onClick={() => navigate(`/demo-product/${targetProduct.id}`)}>Xem Đánh Giá Cộng Đồng</Button>
              </Col>
            </Row>
          ) : (
            <Card className="border-0 p-4 rounded-3 shadow-sm bg-white">
              <Form onSubmit={handleCreateReview}>
                <div className="mb-4 bg-light p-3 rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <span className="small text-secondary fw-semibold">Chọn số sao đánh giá:</span>
                  <div className="d-flex gap-1 text-warning" style={{ cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} onClick={() => setRating(s)}>
                        <StarFill size={24} className={s <= rating ? "text-warning" : "text-black-50 opacity-25"} />
                      </span>
                    ))}
                  </div>
                </div>
                <Form.Group className="mb-4">
                  <Form.Control as="textarea" rows={4} value={comment} onChange={e => setComment(e.target.value)} required className="p-3 fs-6 rounded-3" />
                </Form.Group>
                <div className="d-flex gap-2 justify-content-end">
                  <Button variant="light" className="px-4 py-2 text-muted border fw-semibold" onClick={() => setShowForm(false)}>Hủy</Button>
                  <Button type="submit" variant="dark" className="px-4 py-2 fw-bold" style={{ backgroundColor: '#2b3a4a', border: 'none' }}>Gửi Đánh Giá</Button>
                </div>
              </Form>
            </Card>
          )}
        </div>
      )}

      {/* ĐÃ ĐÁNH GIÁ -> HIỂN THỊ CHẾ ĐỘ INLINE-EDIT TẠI CHỖ */}
      {currentOrder.isReviewed && (
        <Card className="border-0 p-4 rounded-3 shadow-sm bg-white border-top border-4" style={{ borderTopColor: '#2b3a4a' }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <span className="text-muted fw-bold tracking-wider" style={{ fontSize: '11px' }}>NỘI DUNG ĐÁNH GIÁ CỦA BẠN</span>
            <div className="text-warning small">
              {[...Array(currentOrder.rating)].map((_, i) => <StarFill key={i} className="text-warning me-0.5" />)}
            </div>
          </div>

          {isEditing ? (
            <div>
              <Form.Control as="textarea" rows={3} value={editComment} onChange={e => setEditComment(e.target.value)} className="fs-6 p-3 rounded-3" />
              <div className="mt-3 d-flex gap-2 justify-content-end">
                <Button variant="light" size="sm" className="border px-3 text-muted fw-semibold" onClick={() => setIsEditing(false)}>Hủy</Button>
                <Button variant="dark" size="sm" className="px-4 fw-bold" style={{ backgroundColor: '#2b3a4a', border: 'none' }} onClick={handleSaveEdit}>Lưu Thay Đổi</Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="p-3 rounded bg-light text-dark mb-3 fs-6 fw-medium">{currentOrder.comment}</p>
              <div className="d-flex justify-content-between align-items-center">
                <Button variant="link" size="sm" className="text-secondary text-decoration-none p-0 small fw-bold" onClick={() => navigate(`/demo-product/${targetProduct.id}`)}>➡️ Xem Đánh Giá Trên Sàn</Button>
                <Button variant="link" size="sm" className="d-flex align-items-center gap-1 text-secondary text-decoration-none p-0" onClick={() => { setIsEditing(true); setEditComment(currentOrder.comment); }}>
                  <PencilSquare size={13}/> Sửa nhận xét nhanh
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}