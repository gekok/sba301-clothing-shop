import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import RatingStars from './RatingStars.jsx';
import { submitReview } from '../services/reviewApi.js';

// Modal viết đánh giá cho 1 order item — nhúng vào MyOrders, chỉ mở được cho
// item thuộc đơn COMPLETED và chưa review (điều kiện gác ở MyOrders.jsx).
export default function ReviewFormModal({ show, onHide, item, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetAndHide = () => {
    if (submitting) return;
    setRating(0);
    setComment('');
    setError('');
    onHide();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá.');
      return;
    }
    if (comment.trim().length < 5) {
      setError('Nội dung đánh giá cần ít nhất 5 ký tự.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await submitReview(item.productId, {
        orderItemId: item.orderItemId,
        rating,
        comment: comment.trim(),
      });
      onSubmitted(item.orderItemId);
      setRating(0);
      setComment('');
      onHide();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <Modal show={show} onHide={resetAndHide} centered>
      <Modal.Header closeButton className="border-bottom border-dark border-2 bg-light">
        <Modal.Title className="fw-bold text-uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Đánh giá sản phẩm
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          <div className="mb-3 p-2 bg-light border border-dark">
            <div className="fw-bold">{item.productName}</div>
            <div className="text-muted small">{item.variantInfo}</div>
          </div>

          {error && <Alert variant="danger" className="rounded-0 py-2">{error}</Alert>}

          <div className="mb-3">
            <label className="form-label fw-bold text-uppercase small d-block">Số sao của bạn</label>
            <RatingStars value={rating} onChange={setRating} size="lg" />
          </div>

          <div className="mb-2">
            <label className="form-label fw-bold text-uppercase small" htmlFor="review-comment">
              Nhận xét
            </label>
            <Form.Control
              id="review-comment"
              as="textarea"
              rows={4}
              className="rounded-0"
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="border-top border-dark border-2">
          <Button
            variant="outline-dark"
            className="rounded-0 text-uppercase fw-bold"
            onClick={resetAndHide}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button type="submit" variant="dark" className="rounded-0 text-uppercase fw-bold px-4" disabled={submitting}>
            {submitting ? <Spinner animation="border" size="sm" /> : 'Gửi đánh giá'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
