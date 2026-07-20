import { useMemo } from 'react';
import { getFeaturedProducts } from '../services/home.service.js';

export const useFeaturedProducts = (limit = 3) => {
    const products = useMemo(() => getFeaturedProducts(limit), [limit]);
    return { products };
}