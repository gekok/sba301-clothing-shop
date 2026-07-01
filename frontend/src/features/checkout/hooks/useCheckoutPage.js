import { useState, useEffect, useMemo } from 'react';
import { getCartSnapshot } from '../../cart/services/cartService.js';
import { applyVoucherAPI, addAddressAPI, getAddressesAPI, getShippingMethodsAPI } from '../services/checkoutService.js';
import { getItemsSubtotal } from '../../cart/utils/cartMath.js';
import { getDiscountAmount, getCartTotals } from '../utils/checkoutMath.js';
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
        
        const [cartRes, addressRes, shippingRes] = await Promise.all([
          getCartSnapshot(),
          getAddressesAPI(),
          getShippingMethodsAPI()
        ]);
        if (!mounted) return;

        const cartData = cartRes;
        const addressesData = addressRes.data;
        const shippingData = shippingRes.data;

        // Chỉ lấy những item nào được chọn và còn hàng
        const validItems = cartData.items.filter(item => isPurchasable(item) && intentIds.includes(item.id));
        setCheckoutItems(validItems);

        setAddresses(addressesData || []);
        setShippingMethods(shippingData || []);

        if (addressesData?.length > 0) {
          const defaultAddr = addressesData.find(a => a.isDefault);
          setSelectedAddressId(defaultAddr ? defaultAddr.id : addressesData[0].id);
        }

        if (shippingData?.length > 0) {
          setSelectedShippingId(shippingData[0].id);
        }

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
