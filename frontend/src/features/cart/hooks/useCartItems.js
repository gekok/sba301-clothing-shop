import { useState, useEffect, useMemo } from 'react';
import { addItemAPI, updateQuantityAPI, removeItemAPI, clearUnavailableItemsAPI } from '../services/cartService.js';
import { getItemsSubtotal } from '../utils/cartMath.js';

export const isPurchasable = (item) => item.isActive && item.stockQuantity > 0;

export function useCartItems({ setCartAlert }) {
  const [items, setItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [isUpdatingItems, setIsUpdatingItems] = useState(false);

  // Lọc bỏ những ID sản phẩm đang chọn nếu sản phẩm đó bị xoá khỏi danh sách gốc
  useEffect(() => {
    setSelectedItemIds((previousIds) =>
      previousIds.filter((id) => items.some((item) => item.id === id && isPurchasable(item))),
    );
  }, [items]);

  const changeItemQuantity = async (itemId, nextQuantity) => {
    const itemToUpdate = items.find(i => i.id === itemId);
    if (!itemToUpdate) return;
    
    const boundedQuantity = Math.max(1, Math.min(nextQuantity, itemToUpdate.stockQuantity));
    if (boundedQuantity === itemToUpdate.quantity) return;

    setIsUpdatingItems(true);
    try {
      await updateQuantityAPI(itemId, boundedQuantity);
      setItems((previousItems) =>
        previousItems.map((item) => {
          if (item.id !== itemId) {
            return item;
          }
          return {
            ...item,
            quantity: boundedQuantity,
          };
        }),
      );
    } catch (error) {
      setCartAlert({
        title: 'Lỗi',
        message: 'Không thể cập nhật số lượng. Vui lòng thử lại.',
        type: 'danger',
      });
    } finally {
      setIsUpdatingItems(false);
    }
  };

  const addToCart = async (newItem) => {
    if (!newItem.isActive || newItem.stockQuantity <= 0) {
      setCartAlert({
        title: 'Thông báo lỗi',
        message: `Sản phẩm mẫu mã ${newItem.sku} đã hết hàng hoặc ngừng kinh doanh!`,
        type: 'danger',
      });
      return;
    }

    setIsUpdatingItems(true);
    try {
      await addItemAPI(newItem);

      setItems((previousItems) => {
        const existingIndex = previousItems.findIndex(
          (item) => {
            const isSameVariant = item.variantId && newItem.variantId && item.variantId === newItem.variantId;
            const isSameSku = item.sku && newItem.sku && item.sku === newItem.sku;
            const isSameAttributes = item.productId === newItem.productId 
                                     && item.color === newItem.color 
                                     && item.size === newItem.size;
            return isSameVariant || isSameSku || isSameAttributes;
          }
        );

        if (existingIndex !== -1) {
          const currentItem = previousItems[existingIndex];
          if (currentItem.quantity >= currentItem.stockQuantity) {
            setCartAlert({
              title: 'Giới hạn số lượng',
              message: `Mẫu mã ${currentItem.sku} đã đạt giới hạn tồn kho tối đa (${currentItem.stockQuantity} sản phẩm)!`,
              type: 'warning',
            });
            return previousItems;
          }

          return previousItems.map((item, idx) => {
            if (idx === existingIndex) {
              const addedQty = newItem.quantity || 1;
              const newQty = Math.min(item.quantity + addedQty, item.stockQuantity);
              return { ...item, quantity: newQty };
            }
            return item;
          });
        }

        const newId = previousItems.length > 0 ? Math.max(...previousItems.map((i) => i.id)) + 1 : 1001;
        const initialQty = Math.min(newItem.quantity || 1, newItem.stockQuantity);
        
        const createdItem = {
          id: newId,
          cartItemId: newId,
          ...newItem,
          quantity: initialQty,
        };

        setSelectedItemIds((prevSelected) => [...prevSelected, newId]);
        return [...previousItems, createdItem];
      });
    } catch (error) {
      setCartAlert({
        title: 'Lỗi',
        message: 'Thêm vào giỏ hàng thất bại. Vui lòng thử lại.',
        type: 'danger',
      });
    } finally {
      setIsUpdatingItems(false);
    }
  };

  const removeItem = async (itemId) => {
    setIsUpdatingItems(true);
    try {
      await removeItemAPI(itemId);
      setItems((previousItems) => previousItems.filter((item) => item.id !== itemId));
      setSelectedItemIds((previousIds) => previousIds.filter((id) => id !== itemId));
    } catch (error) {
      setCartAlert({
        title: 'Lỗi',
        message: 'Không thể xoá sản phẩm. Vui lòng thử lại.',
        type: 'danger',
      });
    } finally {
      setIsUpdatingItems(false);
    }
  };

  const clearUnavailableItems = async () => {
    const unavailableIds = items.filter((item) => !isPurchasable(item)).map((item) => item.id);
    if (unavailableIds.length === 0) return;

    setIsUpdatingItems(true);
    try {
      await clearUnavailableItemsAPI(unavailableIds);
      setItems((previousItems) => previousItems.filter(isPurchasable));
      setSelectedItemIds((previousIds) => previousIds.filter((id) => !unavailableIds.includes(id)));
    } catch (error) {
      setCartAlert({
        title: 'Lỗi',
        message: 'Không thể xoá các sản phẩm hết hàng. Vui lòng thử lại.',
        type: 'danger',
      });
    } finally {
      setIsUpdatingItems(false);
    }
  };

  const toggleSelectAll = () => {
    if (allPurchasableSelected) {
      setSelectedItemIds([]);
      return;
    }
    setSelectedItemIds(purchasableItems.map((item) => item.id));
  };

  const toggleItem = (itemId) => {
    setSelectedItemIds((previousIds) => {
      if (previousIds.includes(itemId)) {
        return previousIds.filter((id) => id !== itemId);
      }
      return [...previousIds, itemId];
    });
  };

  const selectedItems = useMemo(() => items.filter((item) => selectedItemIds.includes(item.id)), [items, selectedItemIds]);
  const purchasableItems = useMemo(() => items.filter(isPurchasable), [items]);
  const unavailableCount = items.filter((item) => !isPurchasable(item)).length;
  const allPurchasableSelected = purchasableItems.length > 0 && purchasableItems.every((item) => selectedItemIds.includes(item.id));
  const itemsSubtotal = useMemo(() => getItemsSubtotal(selectedItems), [selectedItems]);

  return {
    items,
    setItems,
    selectedItemIds,
    setSelectedItemIds,
    isUpdatingItems,
    selectedItems,
    purchasableItems,
    unavailableCount,
    allPurchasableSelected,
    itemsSubtotal,
    changeItemQuantity,
    addToCart,
    removeItem,
    clearUnavailableItems,
    toggleSelectAll,
    toggleItem,
  };
}
