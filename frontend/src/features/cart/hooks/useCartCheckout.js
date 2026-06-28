import { useState, useMemo } from 'react';
import { checkoutAPI, applyVoucherAPI } from '../services/cartService.js';
import { getCartTotals, getDiscountAmount } from '../utils/cartMath.js';

export function useCartCheckout({
  itemsSubtotal,
  shippingFee,
  selectedItems,
  selectedAddress,
  selectedShippingMethod,
  refreshCartSnapshot,
}) {
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(null);
  const [voucherNotice, setVoucherNotice] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [checkoutNotice, setCheckoutNotice] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  const discountAmount = useMemo(
    () =>
      getDiscountAmount({
        voucher: voucherApplied,
        itemsSubtotal,
        shippingFee,
      }),
    [voucherApplied, itemsSubtotal, shippingFee],
  );

  const totals = useMemo(
    () =>
      getCartTotals({
        itemsSubtotal,
        shippingFee,
        discountAmount,
      }),
    [itemsSubtotal, shippingFee, discountAmount],
  );

  const canCheckout = selectedItems.length > 0 && Boolean(selectedAddress) && Boolean(selectedShippingMethod);

  const applyVoucher = async () => {
    const code = voucherInput.trim().toUpperCase();

    if (!code) {
      setVoucherApplied(null);
      setVoucherNotice('Đã xoá mã giảm giá.');
      return;
    }

    setCheckingOut(true);
    try {
      const response = await applyVoucherAPI(code);
      setVoucherApplied(response.data);
      setVoucherNotice(`Đã áp dụng ${response.data.code}: ${response.data.description}`);
    } catch (error) {
      setVoucherApplied(null);
      setVoucherNotice(error.message || 'Mã giảm giá không hợp lệ. Thử lại với FREESHIP30, SALE40K hoặc SAVE10.');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    setCheckoutNotice('');

    try {
      const previousSelectedCount = selectedItems.length;
      const previousAddressSelected = Boolean(selectedAddress);
      const previousShippingSelected = Boolean(selectedShippingMethod);

      const { removedCount, nextSelectedIds } = await refreshCartSnapshot({ forCheckout: true });

      if (!previousAddressSelected || !previousShippingSelected || nextSelectedIds.length === 0) {
        setCheckoutNotice('Chưa đủ điều kiện để đặt hàng. Vui lòng chọn sản phẩm hợp lệ và địa chỉ giao hàng.');
        return;
      }

      if (removedCount > 0 || nextSelectedIds.length !== previousSelectedCount) {
        setCheckoutNotice('Một số sản phẩm đã thay đổi tồn kho trong lúc thao tác. Vui lòng kiểm tra lại giỏ hàng.');
        return;
      }

      // Payload giả lập gửi lên Backend
      const payload = {
        itemIds: nextSelectedIds,
        addressId: selectedAddress?.id,
        shippingMethod: selectedShippingMethod?.id,
        voucherCode: voucherApplied?.code || null,
        note: orderNote
      };

      await checkoutAPI(payload);

      setCheckoutNotice('Tồn kho đã được kiểm tra lại. Dữ liệu giỏ hàng hiện đã sẵn sàng để tạo đơn.');
      
    } catch (_error) {
      setCheckoutNotice('Không thể xác thực tồn kho lúc này. Vui lòng thử lại.');
    } finally {
      setCheckingOut(false);
    }
  };

  const reloadCart = async (setLoading, setErrorMessage) => {
    setLoading(true);
    setErrorMessage('');

    try {
      await refreshCartSnapshot();
      setVoucherApplied(null);
      setVoucherInput('');
      setVoucherNotice('');
      setOrderNote('');
      setCheckoutNotice('');
    } catch (_error) {
      setErrorMessage('Tải lại giỏ hàng thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return {
    voucherInput,
    setVoucherInput,
    voucherApplied,
    setVoucherApplied,
    voucherNotice,
    setVoucherNotice,
    orderNote,
    setOrderNote,
    checkoutNotice,
    setCheckoutNotice,
    checkingOut,
    setCheckingOut,
    discountAmount,
    totals,
    canCheckout,
    applyVoucher,
    handleCheckout,
    reloadCart,
  };
}
