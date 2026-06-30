import { useState, useEffect, useMemo } from 'react';
import { getCartSnapshot, applyVoucherAPI, addAddressAPI } from '../../cart/services/cartService.js';
import { getItemsSubtotal, getDiscountAmount, getCartTotals } from '../../cart/utils/cartMath.js';
import { isPurchasable } from '../../cart/hooks/useCartItems.js';

export function useCheckoutPage() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedShippingId, setSelectedShippingId] = useState('');
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(null);
  const [voucherNotice, setVoucherNotice] = useState('');
  const [orderNote, setOrderNote] = useState('');
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState('');

  useEffect(() => {
    let mounted = true;
    async function initCheckout() {
      try {
        const storedIdsRaw = sessionStorage.getItem('checkout_selected_items');
        if (!storedIdsRaw) {
          setErrorMessage('Không tìm thấy thông tin sản phẩm cần thanh toán. Vui lòng quay lại giỏ hàng.');
          setLoading(false);
          return;
        }
        const intentIds = JSON.parse(storedIdsRaw);
        
        const snapshot = await getCartSnapshot();
        if (!mounted) return;

        const availableItems = snapshot.items.filter(isPurchasable);
        
        // Capping items quantity just like in Cart to be safe
        const cappedItems = availableItems.map(item => {
          if (item.quantity > item.stockQuantity && item.stockQuantity > 0) {
            return { ...item, quantity: item.stockQuantity };
          }
          return item;
        });

        const itemsToCheckout = cappedItems.filter(i => intentIds.includes(i.id));

        if (itemsToCheckout.length === 0) {
          setErrorMessage('Các sản phẩm bạn chọn không còn khả dụng hoặc đã hết hàng.');
          setLoading(false);
          return;
        }

        setCheckoutItems(itemsToCheckout);
        setAddresses(snapshot.addresses);
        setShippingMethods(snapshot.shippingMethods);

        const defaultAddr = snapshot.addresses.find(a => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);

        const standardShip = snapshot.shippingMethods.find(m => m.id === 'standard');
        if (standardShip) setSelectedShippingId(standardShip.id);

      } catch (err) {
        setErrorMessage('Lỗi khi tải thông tin thanh toán.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    initCheckout();
    return () => mounted = false;
  }, []);

  const itemsSubtotal = useMemo(() => getItemsSubtotal(checkoutItems), [checkoutItems]);
  const selectedAddress = useMemo(() => addresses.find(a => a.id === selectedAddressId), [addresses, selectedAddressId]);
  const selectedShippingMethod = useMemo(() => shippingMethods.find(m => m.id === selectedShippingId), [shippingMethods, selectedShippingId]);
  const shippingFee = selectedShippingMethod?.fee || 0;

  const discountAmount = useMemo(() => getDiscountAmount({
    voucher: voucherApplied,
    itemsSubtotal,
    shippingFee
  }), [voucherApplied, itemsSubtotal, shippingFee]);

  const totals = useMemo(() => getCartTotals({
    itemsSubtotal,
    shippingFee,
    discountAmount
  }), [itemsSubtotal, shippingFee, discountAmount]);

  const canCheckout = checkoutItems.length > 0 && Boolean(selectedAddress) && Boolean(selectedShippingMethod);

  const applyVoucher = async () => {
    const code = voucherInput.trim().toUpperCase();
    if (!code) {
      setVoucherApplied(null);
      setVoucherNotice('Đã xoá mã giảm giá.');
      return;
    }
    try {
      const response = await applyVoucherAPI(code);
      setVoucherApplied(response.data);
      setVoucherNotice(`Đã áp dụng ${response.data.code}: ${response.data.description}`);
    } catch (error) {
      setVoucherApplied(null);
      setVoucherNotice(error.message || 'Mã giảm giá không hợp lệ.');
    }
  };

  const addAddress = async (addrPayload) => {
    try {
      const res = await addAddressAPI(addrPayload);
      setAddresses(prev => [...prev, res.data]);
      setSelectedAddressId(res.data.id);
    } catch (err) {
      alert("Lỗi khi thêm địa chỉ");
    }
  };

  return {
    loading, errorMessage, checkoutItems, addresses, shippingMethods,
    selectedAddressId, setSelectedAddressId, selectedAddress,
    selectedShippingId, setSelectedShippingId, selectedShippingMethod,
    voucherInput, setVoucherInput, voucherApplied, voucherNotice, applyVoucher,
    orderNote, setOrderNote,
    selectedPaymentMethod, setSelectedPaymentMethod,
    isPlacingOrder, setIsPlacingOrder, checkoutNotice, setCheckoutNotice,
    totals, canCheckout, addAddress
  };
}
