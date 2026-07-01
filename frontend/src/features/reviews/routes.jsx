import ReviewTestPage from './pages/ReviewTestPage.jsx'
import ProductReviewsPage from './pages/ProductReviewsPage.jsx'
import ReviewFormPage from './pages/ReviewFormPage.jsx'

export const reviewRoutes = [
  { path: 'test/reviews', element: <ReviewTestPage /> },
  { path: 'test/reviews/products/:productId', element: <ProductReviewsPage /> },
  { path: 'test/reviews/orders/:orderId/items/:orderItemId/review', element: <ReviewFormPage /> },
]
