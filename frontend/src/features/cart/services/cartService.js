import api from '../../../shared/services/axios.js';

export async function getCartSnapshot() {
  const res = await api.get('/carts/me');
  const backendItems = res.data.items.map(item => {
    const parts = item.variantInfo ? item.variantInfo.split(' / ') : [];
    return {
      ...item,
      size: parts[0] || 'N/A',
      color: parts[1] || 'N/A',
      isActive: item.stockQuantity > 0
    };
  });

  return {
    cartId: res.data.id,
    channel: 'ONLINE',
    items: backendItems
  };
}

export async function addItemAPI(itemPayload) {
  const res = await api.post('/carts/items', {
    variantId: itemPayload.variantId,
    quantity: itemPayload.quantity
  });
  return res.data;
}

export async function updateQuantityAPI(itemId, quantity) {
  const res = await api.put(`/carts/items/${itemId}`, { quantity });
  return res.data;
}

export async function removeItemAPI(itemId) {
  const res = await api.delete(`/carts/items/${itemId}`);
  return res.data;
}

export async function clearUnavailableItemsAPI(itemIds) {
  // Can be resolved as dummy or implement bulk delete
  return Promise.resolve({ success: true });
}



