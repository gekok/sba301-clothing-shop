export const getLowestPrice = (product) => {
    const prices = product.variants?.map((variant) => variant.price) ?? [];
    return prices.length ? Math.min(...prices) : 0;
}