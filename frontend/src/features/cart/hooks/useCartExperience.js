import { useState, useEffect } from 'react';
import { getCartSnapshot } from '../services/cartService.js';
import { useCartItems, isPurchasable } from './useCartItems.js';
import { useNavigate } from 'react-router-dom';

export { isPurchasable };

export function useCartExperience() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [cartAlert, setCartAlert] = useState(null);
  const [stockSyncNotice, setStockSyncNotice] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const navigate = useNavigate();

  const cartItems = useCartItems({ setCartAlert });
  const isUpdating = cartItems.isUpdatingItems;

  const refreshCartSnapshot = async () => {
    const snapshot = await getCartSnapshot();

    let adjustedCount = 0;
    const adjustedItems = snapshot.items.map((item) => {
      if (item.quantity > item.stockQuantity && item.stockQuantity > 0) {
        adjustedCount++;
        return { ...item, quantity: item.stockQuantity };
      }
      return item;
    });

    const availableItemIds = new Set(adjustedItems.filter(isPurchasable).map((item) => item.id));
    const nextSelectedIds = cartItems.selectedItemIds.filter((id) => availableItemIds.has(id));
    const removedCount = cartItems.selectedItemIds.length - nextSelectedIds.length;

    cartItems.setItems(adjustedItems);
    cartItems.setSelectedItemIds(nextSelectedIds);
    setLastSyncedAt(new Date());
    setStockSyncNotice(
      removedCount > 0 || adjustedCount > 0
        ? `Đã cập nhật tồn kho. ${removedCount} sản phẩm bị loại, ${adjustedCount} sản phẩm được điều chỉnh số lượng.`
        : 'Tồn kho đã được đồng bộ lại từ máy chủ.'
    );

    return { removedCount, adjustedCount, nextSelectedIds };
  };

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setErrorMessage('');

      try {
        const snapshot = await getCartSnapshot();
        if (!mounted) return;

        cartItems.setItems(snapshot.items);
        cartItems.setSelectedItemIds(snapshot.items.filter(isPurchasable).map((item) => item.id));
        setLastSyncedAt(new Date());
        setStockSyncNotice('Tồn kho đã được tải mới từ máy chủ.');
      } catch (_error) {
        setErrorMessage('Không thể tải giỏ hàng. Vui lòng thử lại.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const proceedToCheckout = async () => {
    const { removedCount, adjustedCount, nextSelectedIds } = await refreshCartSnapshot();
    if (nextSelectedIds.length === 0) {
      setCartAlert({
        title: 'Giỏ hàng trống',
        message: 'Bạn chưa chọn sản phẩm nào để thanh toán.',
        type: 'warning',
      });
      return;
    }
    if (removedCount > 0 || adjustedCount > 0) {
      setCartAlert({
        title: 'Tồn kho thay đổi',
        message: 'Một số sản phẩm đã thay đổi số lượng. Vui lòng kiểm tra lại trước khi tiếp tục.',
        type: 'warning',
      });
      return;
    }

    // Save selected items intent to session storage
    sessionStorage.setItem('checkout_selected_items', JSON.stringify(nextSelectedIds));
    navigate('/checkout');
  };

  const reloadCart = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      await refreshCartSnapshot();
    } catch (_error) {
      setErrorMessage('Tải lại giỏ hàng thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    isUpdating,
    errorMessage,
    cartAlert,
    setCartAlert,
    stockSyncNotice,
    lastSyncedAt,
    
    items: cartItems.items,
    selectedItemIds: cartItems.selectedItemIds,
    purchasableItems: cartItems.purchasableItems,
    unavailableCount: cartItems.unavailableCount,
    allPurchasableSelected: cartItems.allPurchasableSelected,
    itemsSubtotal: cartItems.itemsSubtotal,

    toggleSelectAll: cartItems.toggleSelectAll,
    toggleItem: cartItems.toggleItem,
    changeItemQuantity: cartItems.changeItemQuantity,
    addToCart: cartItems.addToCart,
    removeItem: cartItems.removeItem,
    clearUnavailableItems: cartItems.clearUnavailableItems,
    reloadCart,
    proceedToCheckout,
  };
}
