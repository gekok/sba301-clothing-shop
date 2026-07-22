import { useEffect, useState } from 'react';
import { getFeaturedProducts } from '../services/homeService.js';

/**
 * Hook lấy sản phẩm nổi bật.
 * Hiện tại dùng mock sync — chỉ cần đổi getFeaturedProducts thành async
 * (gọi API) là hook này hoạt động ngay, không cần sửa thêm.
 */
export const useFeaturedProducts = (limit = 3) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        try {
            // Mock sync — thay bằng: const data = await getFeaturedProducts(limit);
            const data = getFeaturedProducts(limit);
            setProducts(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    return { products, loading, error };
};