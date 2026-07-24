import api from '../../../shared/services/axios.js'

export async function searchReviews({productId, rating, isVisible, keyword, page = 0, size = 10} = {}) {
    const res = await api.get('/admin/reviews', {
        params: {productId, rating, isVisible, keyword, page, size},
    })
    return res.data
}

export async function updateVisibility(id, isVisible) {
    const res = await api.patch(`/admin/reviews/${id}/visibility`, {isVisible})
    return res.data
}
