import { useState } from 'react'
import RatingStars from './RatingStars.jsx'
import { getPrimaryImage } from '../services/reviewsService.js'

/**
 * ReviewForm
 * props:
 * - product: { id, name, images }
 * - onSubmit: function({ rating, comment })
 * - onCancel: function
 */
export default function ReviewForm({ product, onSubmit, onCancel }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá.')
      return
    }
    if (comment.trim().length < 5) {
      setError('Nội dung đánh giá cần ít nhất 5 ký tự.')
      return
    }
    setError('')
    onSubmit({ rating, comment: comment.trim() })
  }

  return (
    <form onSubmit={handleSubmit}>
      {product && (
        <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded">
          <img
            src={getPrimaryImage(product)}
            alt={product.name}
            width={56}
            height={56}
            className="rounded"
            style={{ objectFit: 'cover' }}
          />
          <div className="fw-semibold">{product.name}</div>
        </div>
      )}

      <div className="mb-3">
        <label className="form-label fw-semibold d-block">Số sao của bạn</label>
        <RatingStars value={rating} onChange={setRating} size="lg" />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold" htmlFor="review-comment">
          Nhận xét
        </label>
        <textarea
          id="review-comment"
          className="form-control"
          rows={4}
          placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary">
          Gửi đánh giá
        </button>
        {onCancel && (
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
            Hủy
          </button>
        )}
      </div>
    </form>
  )
}
