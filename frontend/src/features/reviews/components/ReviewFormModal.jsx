import { useEffect, useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import RatingStars from './RatingStars.jsx';
import { submitReview, updateReview } from '../services/reviewApi.js';

// Modal viết đánh giá — hỗ trợ 2 mode:
// - mode='create' (mặc định, giữ nguyên hành vi cũ): nhúng trong MyOrders.jsx, tạo review mới
//   cho 1 order item (item.productId, item.orderItemId, item.productName, item.variantInfo).
// - mode='edit' (Phase 6b): nhúng trong CustomerProductDetail.jsx, sửa 1 review đã có của
//   chính mình (review.id, review.productId, review.rating, review.comment, review.productName)
//   — chỉ mở được khi ReviewItem đã tự xác định canEdit=true (ownership + trong 24h + chưa sửa
//   lần nào), nhưng BE vẫn là nguồn sự thật cuối cùng khi submit.
export default function ReviewFormModal({ show, onHide, mode = 'create', item, review, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEdit = mode === 'edit';
  const source = isEdit ? review : item;

  // Prefill khi mở modal edit (mỗi lần đổi review đang sửa hoặc mở lại modal).
  useEffect(() => {
    if (show && isEdit && review) {
      setRating(review.rating || 0);
      setComment(review.comment || '');
      setError('');
    }
    if (show && !isEdit) {
      setRating(0);
      setComment('');
      setError('');
    }
  }, [show, isEdit, review]);

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
      if (isEdit) {
        const updated = await updateReview(review.productId, review.id, {
          rating,
          comment: comment.trim(),
        });
        onSubmitted(updated);
      } else {
        await submitReview(item.productId, {
          orderItemId: item.orderItemId,
          rating,
          comment: comment.trim(),
        });
        onSubmitted(item.orderItemId);
      }
      setRating(0);
      setComment('');
      onHide();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isEdit ? 'Không thể cập nhật đánh giá. Vui lòng thử lại.' : 'Không thể gửi đánh giá. Vui lòng thử lại.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!source) return null;

  return (
    <Modal show={show} onHide={resetAndHide} centered>
      <Modal.Header closeButton className="border-bottom border-dark border-2 bg-light">
        <Modal.Title className="fw-bold text-uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {isEdit ? 'Chỉnh sửa đánh giá' : 'Đánh giá sản phẩm'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {(source.productName || source.variantInfo) && (
            <div className="mb-3 p-2 bg-light border border-dark">
              {source.productName && <div className="fw-bold">{source.productName}</div>}
              {source.variantInfo && <div className="text-muted small">{source.variantInfo}</div>}
            </div>
          )}

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

          {isEdit && (
            <div className="text-muted small">
              Lưu ý: mỗi đánh giá chỉ được sửa 1 lần, trong vòng 24 giờ kể từ lúc tạo.
            </div>
          )}
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
            {submitting ? <Spinner animation="border" size="sm" /> : isEdit ? 'Lưu thay đổi' : 'Gửi đánh giá'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
