import { useState, useEffect } from 'react';
import { getCartSnapshot } from '../services/cartService.js';
import { useCartItems, isPurchasable } from './useCartItems.js';
import { useCartAddresses } from './useCartAddresses.js';
import { useCartCheckout } from './useCartCheckout.js';

export { isPurchasable };

export function useCartExperience() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [cartAlert, setCartAlert] = useState(null);
  const [stockSyncNotice, setStockSyncNotice] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const cartItems = useCartItems({ setCartAlert });
  const cartAddresses = useCartAddresses({ setCartAlert });

  const isUpdating = cartItems.isUpdatingItems || cartAddresses.isUpdatingAddresses;
  const shippingFee = cartItems.selectedItems.length > 0 ? cartAddresses.selectedShippingMethod?.fee ?? 0 : 0;

  const refreshCartSnapshot = async ({ forCheckout = false } = {}) => {
    const snapshot = await getCartSnapshot();
    const availableItemIds = new Set(snapshot.items.filter(isPurchasable).map((item) => item.id));
    const nextSelectedIds = cartItems.selectedItemIds.filter((id) => availableItemIds.has(id));
    const removedCount = cartItems.selectedItemIds.length - nextSelectedIds.length;

    cartItems.setItems(snapshot.items);
    cartAddresses.setAddresses(snapshot.addresses);
    cartAddresses.setShippingMethods(snapshot.shippingMethods);

    cartAddresses.setSelectedAddressId((currentId) =>
      snapshot.addresses.some((address) => address.id === currentId)
        ? currentId
        : snapshot.addresses.find((address) => address.isDefault)?.id ?? snapshot.addresses[0]?.id ?? null,
    );

    cartAddresses.setSelectedShippingId((currentId) =>
      snapshot.shippingMethods.some((method) => method.id === currentId)
        ? currentId
        : snapshot.shippingMethods.find((method) => method.id === 'standard')?.id ?? snapshot.shippingMethods[0]?.id ?? '',
    );

    cartItems.setSelectedItemIds(nextSelectedIds);
    setLastSyncedAt(new Date());
    setStockSyncNotice(
      removedCount > 0
        ? `Đã cập nhật tồn kho. ${removedCount} sản phẩm không còn khả dụng và đã bị loại khỏi lựa chọn.`
        : forCheckout
          ? 'Tồn kho đã được kiểm tra lại trước khi thanh toán.'
          : 'Tồn kho đã được đồng bộ lại từ máy chủ.',
    );

    return { removedCount, nextSelectedIds };
  };

  const cartCheckout = useCartCheckout({
    itemsSubtotal: cartItems.itemsSubtotal,
    shippingFee,
    selectedItems: cartItems.selectedItems,
    selectedAddress: cartAddresses.selectedAddress,
    selectedShippingMethod: cartAddresses.selectedShippingMethod,
    refreshCartSnapshot,
  });

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setErrorMessage('');

      try {
        const snapshot = await getCartSnapshot();
        if (!mounted) return;

        cartItems.setItems(snapshot.items);
        cartAddresses.setAddresses(snapshot.addresses);
        cartAddresses.setShippingMethods(snapshot.shippingMethods);

        const defaultAddress = snapshot.addresses.find((addr) => addr.isDefault);
        if (defaultAddress) {
          cartAddresses.setSelectedAddressId(defaultAddress.id);
        }

        const validShipping = snapshot.shippingMethods.find((method) => method.id === 'standard');
        cartAddresses.setSelectedShippingId(validShipping ? validShipping.id : snapshot.shippingMethods[0]?.id ?? '');

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

  return {
    loading,
    isUpdating,
    errorMessage,
    cartAlert,
    setCartAlert,
    stockSyncNotice,
    lastSyncedAt,
    
    // Phơi bày (expose) API giống hệt hook cũ để UI không bị lỗi
    items: cartItems.items,
    addresses: cartAddresses.addresses,
    shippingMethods: cartAddresses.shippingMethods,
    selectedAddressId: cartAddresses.selectedAddressId,
    selectedShippingId: cartAddresses.selectedShippingId,
    selectedItemIds: cartItems.selectedItemIds,
    voucherInput: cartCheckout.voucherInput,
    voucherNotice: cartCheckout.voucherNotice,
    orderNote: cartCheckout.orderNote,
    checkoutNotice: cartCheckout.checkoutNotice,
    checkingOut: cartCheckout.checkingOut,

    purchasableItems: cartItems.purchasableItems,
    unavailableCount: cartItems.unavailableCount,
    totals: cartCheckout.totals,
    canCheckout: cartCheckout.canCheckout,
    allPurchasableSelected: cartItems.allPurchasableSelected,
    selectedAddress: cartAddresses.selectedAddress,

    setSelectedAddressId: cartAddresses.setSelectedAddressId,
    setSelectedShippingId: cartAddresses.setSelectedShippingId,
    setVoucherInput: cartCheckout.setVoucherInput,
    setOrderNote: cartCheckout.setOrderNote,
    toggleSelectAll: cartItems.toggleSelectAll,
    toggleItem: cartItems.toggleItem,
    changeItemQuantity: cartItems.changeItemQuantity,
    addToCart: cartItems.addToCart,
    removeItem: cartItems.removeItem,
    clearUnavailableItems: cartItems.clearUnavailableItems,
    applyVoucher: cartCheckout.applyVoucher,
    reloadCart: () => cartCheckout.reloadCart(setLoading, setErrorMessage),
    handleCheckout: cartCheckout.handleCheckout,
    addAddress: cartAddresses.addAddress,
  };
}
