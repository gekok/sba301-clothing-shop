import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCartSnapshot } from '../services/cartService.js';
import { useCartItems, isPurchasable } from './useCartItems.js';
import { useNavigate } from 'react-router-dom';
import api from '../../../shared/services/axios.js';

export { isPurchasable };

export function useCartExperience() {
  const [errorMessage, setErrorMessage] = useState('');
  const [cartAlert, setCartAlert] = useState(null);
  const [stockSyncNotice, setStockSyncNotice] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const cartItems = useCartItems({ setCartAlert });
  const isUpdating = cartItems.isUpdatingItems;

  const { data: snapshot, isLoading: loading, isError, refetch } = useQuery({
    queryKey: ['cartSnapshot'],
    queryFn: getCartSnapshot,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (isError) {
      setErrorMessage('Không thể tải giỏ hàng. Vui lòng thử lại.');
    } else {
      setErrorMessage('');
    }
  }, [isError]);

  useEffect(() => {
    if (snapshot) {
      // Background check for discrepancies
      let adjustedItemsList = [];
      let removedItemsList = [];
      
      let needsModal = false;

      // We use the local state to know the "old" quantity if available, 
      // otherwise we use the freshItem.quantity from the backend cart.
      snapshot.items.forEach(freshItem => {
         const localItem = cartItems.items.find(i => i.id === freshItem.id);
         const oldQuantity = localItem ? localItem.quantity : freshItem.quantity;

         if (!isPurchasable(freshItem)) {
             removedItemsList.push(localItem || freshItem);
             needsModal = true;
         } else if (oldQuantity > freshItem.stockQuantity) {
             adjustedItemsList.push({
                 ...(localItem || freshItem),
                 oldQuantity: oldQuantity,
                 newQuantity: freshItem.stockQuantity
             });
             needsModal = true;
         }
      });

      if (needsModal && !cartAlert) {
         setCartAlert({
           title: 'Tồn kho thay đổi',
           type: 'warning',
           isConfirm: true,
           isFromCheckout: false,
           removedItems: removedItemsList,
           adjustedItems: adjustedItemsList
         });
      } else if (!needsModal) {
         cartItems.setItems(snapshot.items);
         const availableItemIds = new Set(snapshot.items.filter(isPurchasable).map((item) => item.id));
         cartItems.setSelectedItemIds((prevSelected) => {
           return prevSelected.filter((id) => availableItemIds.has(id));
         });
         setLastSyncedAt(new Date());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  const handleAcknowledgeChanges = async (proceed = false) => {
    if (!cartAlert || !cartAlert.isConfirm) return;
    
    setCartAlert(null); // Close modal immediately for better UX
    
    // Apply changes to backend sequentially
    for (const item of cartAlert.removedItems || []) {
      await cartItems.removeItem(item.id);
    }
    
    for (const item of cartAlert.adjustedItems || []) {
      await cartItems.changeItemQuantity(item.id, item.newQuantity);
    }
    
    // Force a refetch to ensure local state and backend are perfectly synced
    await refetch();
    
    if (proceed) {
      // Re-trigger proceedToCheckout with forceBypass = true
      proceedToCheckout(true);
    }
  };

  const proceedToCheckout = async (forceBypass = false) => {
    const isBypass = typeof forceBypass === 'boolean' ? forceBypass : false;

    // Force a fresh check before checkout
    const result = await refetch();
    const freshSnapshot = result.data;

    if (!freshSnapshot) return;

    if (cartItems.selectedItemIds.length === 0) {
      setCartAlert({
        title: 'Giỏ hàng trống',
        message: 'Bạn chưa chọn sản phẩm nào để thanh toán.',
        type: 'warning',
      });
      return;
    }

    let adjustedItemsList = [];
    let removedItemsList = [];
    const freshItemsMap = new Map(freshSnapshot.items.map(i => [i.id, i]));

    cartItems.selectedItemIds.forEach(id => {
      const localItem = cartItems.items.find(i => i.id === id);
      const freshItem = freshItemsMap.get(id);

      if (!freshItem || !isPurchasable(freshItem)) {
        if (localItem) removedItemsList.push(localItem);
      } else if (localItem && localItem.quantity > freshItem.stockQuantity) {
        adjustedItemsList.push({
          ...localItem,
          oldQuantity: localItem.quantity,
          newQuantity: freshItem.stockQuantity
        });
      }
    });

    if (!isBypass && (removedItemsList.length > 0 || adjustedItemsList.length > 0)) {
      setCartAlert({
        title: 'Tồn kho thay đổi',
        type: 'warning',
        isConfirm: true,
        isFromCheckout: true,
        removedItems: removedItemsList,
        adjustedItems: adjustedItemsList
      });
      return;
    }

    const availableItemIds = new Set(freshSnapshot.items.filter(isPurchasable).map((item) => item.id));
    const finalSelectedIds = cartItems.selectedItemIds.filter((id) => availableItemIds.has(id));

    if (finalSelectedIds.length === 0) {
      setCartAlert({
        title: 'Giỏ hàng trống',
        message: 'Tất cả sản phẩm bạn chọn đều đã hết hàng.',
        type: 'warning',
      });
      return;
    }

    try {
      const res = await api.post('/checkout/session/init', { cartItemIds: finalSelectedIds });
      sessionStorage.setItem('checkout_session_id', res.data.sessionId);
      navigate('/checkout');
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi tạo phiên thanh toán.';
      setCartAlert({
        title: 'Lỗi thanh toán',
        message: msg,
        type: 'warning'
      });
    }
  };

  const reloadCart = async () => {
    setErrorMessage('');
    try {
      await refetch();
    } catch (_error) {
      setErrorMessage('Tải lại giỏ hàng thất bại.');
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
    handleAcknowledgeChanges,
  };
}
