import { Link, useParams } from 'react-router-dom'
import { getPrimaryImage, getCurrentUser } from '../services/reviewsService.js'
import { useProductReviews } from '../hooks/useReviews.js'
import ReviewSummary from '../components/ReviewSummary.jsx'
import ReviewList from '../components/ReviewList.jsx'

export default function ProductReviewsPage() {
  const { productId } = useParams()
  const { product, reviews, summary } = useProductReviews(productId)
  const currentUser = getCurrentUser()

  if (!product) {
    return (
      <div className="container">
        <p className="text-danger">Không tìm thấy sản phẩm.</p>
        <Link to="/test/reviews" className="btn btn-sm btn-outline-secondary">
          ← Về trang test reviews
        </Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <Link to="/test/reviews" className="text-decoration-none small">
        ← Quay lại
      </Link>

      <div className="d-flex gap-3 align-items-center my-3">
        <img
          src={getPrimaryImage(product)}
          alt={product.name}
          width={96}
          height={96}
          className="rounded"
          style={{ objectFit: 'cover' }}
        />
        <div>
          <h4 className="mb-1">{product.name}</h4>
          <div className="text-muted">{product.basePrice.toLocaleString('vi-VN')} đ</div>
        </div>
      </div>

      <ReviewSummary summary={summary} />

      <h5 className="mt-4 mb-3">Đánh giá từ khách hàng</h5>
      <ReviewList reviews={reviews} currentUserId={currentUser.id} />
    </div>
  )
}
