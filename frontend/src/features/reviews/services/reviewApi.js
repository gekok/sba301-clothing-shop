import api from '../../../shared/services/axios.js'

export async function fetchReviewSummary(productId) {
    const res = await api.get(`/products/${productId}/reviews/summary`)
    return res.data
}

export async function fetchReviews(productId, {page = 0, size = 10} = {}) {
    const res = await api.get(`/products/${productId}/reviews`, {
        params: {page, size},
    })
    return res.data
}

export async function submitReview(productId, {orderItemId, rating, comment}) {
    const res = await api.post(`/products/${productId}/reviews`, {
        orderItemId,
        rating,
        comment,
    })
    return res.data
}

export async function updateReview(productId, reviewId, {rating, comment}) {
    const res = await api.put(`/products/${productId}/reviews/${reviewId}`, {
        rating,
        comment,
    })
    return res.data
}

export function normalizeReview(review) {
    return {
        id: review.id,
        userId: review.userId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        orderItemId: review.orderItemId,
        user: {fullName: review.authorName},
    }
}

export function normalizeSummary(summary) {
    return {
        averageRating: summary?.averageRating ?? 0,
        totalReviews: summary?.totalReviews ?? 0,
        breakdown: summary?.breakdown ?? {},
    }
}