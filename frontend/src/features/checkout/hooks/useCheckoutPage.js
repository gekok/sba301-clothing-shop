import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { applyVoucherAPI, addAddressAPI, getAddressesAPI, getShippingMethodsAPI } from '../services/checkoutService.js';
import { getItemsSubtotal } from '../../cart/utils/cartMath.js';
import { getDiscountAmount, getCartTotals } from '../utils/checkoutMath.js';
import api from '../../../shared/services/axios.js';

export function useCheckoutPage() {
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedShippingId, setSelectedShippingId] = useState('');
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(null);
  const [voucherNotice, setVoucherNotice] = useState('');
  const [orderNote, setOrderNote] = useState('');

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState('');

  const [sessionId, setSessionId] = useState(() => sessionStorage.getItem('checkout_session_id'));
  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);

  // 1. Fetch Session Data
  const { data: sessionData, isLoading: isSessionLoading, isError: isSessionError, error: sessionError } = useQuery({
    queryKey: ['checkoutSession', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error("No session ID");
      const res = await api.get(`/checkout/session/${sessionId}`);
      return res.data;
    },
    enabled: !!sessionId,
    retry: false
  });

  // 2. Fetch Addresses
  const { data: addressesData, isLoading: isAddressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await getAddressesAPI();
      return res.data;
    },
  });

  // 3. Fetch Shipping Methods
  const { data: shippingData, isLoading: isShippingLoading } = useQuery({
    queryKey: ['shippingMethods'],
    queryFn: async () => {
      const res = await getShippingMethodsAPI();
      return res.data;
    },
  });

  const loading = isSessionLoading || isAddressesLoading || isShippingLoading;

  useEffect(() => {
    if (isSessionError) {
      setErrorMessage(sessionError?.response?.data?.message || 'Phiên thanh toán không tồn tại hoặc đã hết hạn.');
    }
    if (sessionData) {
      setSessionExpiresAt(sessionData.expiresAt);
    }
  }, [isSessionError, sessionError, sessionData]);

  const checkoutItems = useMemo(() => {
    if (!sessionData) return [];
    return sessionData.items;
  }, [sessionData]);

  const addresses = addressesData || [];
  const shippingMethods = shippingData || [];

  // Initialize selections
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault);
      setSelectedAddressId(defaultAddr ? defaultAddr.id : addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (shippingMethods.length > 0 && !selectedShippingId) {
      setSelectedShippingId(shippingMethods[0].id);
    }
  }, [shippingMethods, selectedShippingId]);

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
    totals, canCheckout, addAddress,
    sessionId, sessionExpiresAt
  };
}
