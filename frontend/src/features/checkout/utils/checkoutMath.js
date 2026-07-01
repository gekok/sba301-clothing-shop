export function getDiscountAmount({ voucher, itemsSubtotal, shippingFee }) {
  if (!voucher) {
    return 0;
  }

  if (voucher.type === 'fixed') {
    return Math.min(voucher.amount, itemsSubtotal);
  }

  if (voucher.type === 'percent') {
    const raw = Math.round((itemsSubtotal * voucher.amount) / 100);
    if (voucher.maxDiscount) {
      return Math.min(raw, voucher.maxDiscount);
    }
    return raw;
  }

  if (voucher.type === 'shipping') {
    return Math.min(voucher.amount, shippingFee);
  }

  return 0;
}

export function getCartTotals({ itemsSubtotal, shippingFee, discountAmount }) {
  const finalTotal = Math.max(itemsSubtotal + shippingFee - discountAmount, 0);
  return {
    itemsSubtotal,
    shippingFee,
    discountAmount,
    finalTotal,
  };
}
