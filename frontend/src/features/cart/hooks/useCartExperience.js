import { useState, useEffect, useMemo } from 'react';
import { voucherCatalog } from '../data/cartMock.js';
import { getCartSnapshot } from '../services/cartService.js';
import {
  getCartTotals,
  getDiscountAmount,
  getItemsSubtotal,
} from '../utils/cartMath.js';

/**
 * Kiểm tra xem sản phẩm có thể mua được hay không (đang hoạt động và còn hàng)
 * @param {Object} item - Đối tượng sản phẩm trong giỏ hàng
 * @returns {boolean} True nếu sản phẩm mua được
 */
export const isPurchasable = (item) => item.isActive && item.stockQuantity > 0;

/**
 * Custom Hook quản lý toàn bộ trạng thái và logic của Giỏ hàng
 * Cung cấp dữ liệu và các hành động (actions) để UI dễ dàng render
 */
export function useCartExperience() {
  // Trạng thái tải dữ liệu và lỗi
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Dữ liệu cốt lõi của giỏ hàng
  const [items, setItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);

  // Lựa chọn của người dùng
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedShippingId, setSelectedShippingId] = useState('standard');
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  // Trạng thái nhập mã giảm giá và ghi chú
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(null);
  const [voucherNotice, setVoucherNotice] = useState('');
  const [orderNote, setOrderNote] = useState('');

  // Thông báo hệ thống và checkout
  const [stockSyncNotice, setStockSyncNotice] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [checkoutNotice, setCheckoutNotice] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  // Trạng thái modal thông báo tùy chỉnh (đồng bộ với UI)
  const [cartAlert, setCartAlert] = useState(null); // { title, message, type }

  /**
   * Load dữ liệu ban đầu cho giỏ hàng
   */
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setErrorMessage('');

      try {
        const snapshot = await getCartSnapshot();
        if (!mounted) return;

        setItems(snapshot.items);
        setAddresses(snapshot.addresses);
        setShippingMethods(snapshot.shippingMethods);

        // Mặc định chọn địa chỉ default hoặc địa chỉ đầu tiên
        const defaultAddress = snapshot.addresses.find((addr) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }

        // Mặc định chọn phương thức giao hàng chuẩn
        const validShipping = snapshot.shippingMethods.find((method) => method.id === 'standard');
        setSelectedShippingId(validShipping ? validShipping.id : snapshot.shippingMethods[0]?.id ?? '');

        // Mặc định chọn tất cả sản phẩm khả dụng
        setSelectedItemIds(snapshot.items.filter(isPurchasable).map((item) => item.id));
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
  }, []);

  /**
   * Lọc bỏ những ID sản phẩm đang chọn nếu sản phẩm đó bị xoá khỏi danh sách gốc
   */
  useEffect(() => {
    setSelectedItemIds((previousIds) =>
      previousIds.filter((id) => items.some((item) => item.id === id && isPurchasable(item))),
    );
  }, [items]);

  // Các dữ liệu được tính toán tự động dựa vào dependency (Computed values)
  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const selectedShippingMethod = useMemo(
    () => shippingMethods.find((method) => method.id === selectedShippingId) ?? null,
    [shippingMethods, selectedShippingId],
  );

  const selectedItems = useMemo(
    () => items.filter((item) => selectedItemIds.includes(item.id)),
    [items, selectedItemIds],
  );

  const purchasableItems = useMemo(() => items.filter(isPurchasable), [items]);

  const itemsSubtotal = useMemo(() => getItemsSubtotal(selectedItems), [selectedItems]);

  const shippingFee = selectedItems.length > 0 ? selectedShippingMethod?.fee ?? 0 : 0;

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

  const unavailableCount = items.filter((item) => !isPurchasable(item)).length;
  const allPurchasableSelected = purchasableItems.length > 0 && purchasableItems.every((item) => selectedItemIds.includes(item.id));
  const canCheckout = selectedItems.length > 0 && Boolean(selectedAddress) && Boolean(selectedShippingMethod);

  /**
   * Làm mới dữ liệu từ server và cập nhật tồn kho
   * @param {Object} options - Chứa tuỳ chọn forCheckout để thay đổi thông báo phù hợp
   */
  const refreshCartSnapshot = async ({ forCheckout = false } = {}) => {
    const snapshot = await getCartSnapshot();
    const availableItemIds = new Set(snapshot.items.filter(isPurchasable).map((item) => item.id));
    const nextSelectedIds = selectedItemIds.filter((id) => availableItemIds.has(id));
    const removedCount = selectedItemIds.length - nextSelectedIds.length;

    setItems(snapshot.items);
    setAddresses(snapshot.addresses);
    setShippingMethods(snapshot.shippingMethods);

    setSelectedAddressId((currentId) =>
      snapshot.addresses.some((address) => address.id === currentId)
        ? currentId
        : snapshot.addresses.find((address) => address.isDefault)?.id ?? snapshot.addresses[0]?.id ?? null,
    );

    setSelectedShippingId((currentId) =>
      snapshot.shippingMethods.some((method) => method.id === currentId)
        ? currentId
        : snapshot.shippingMethods.find((method) => method.id === 'standard')?.id ?? snapshot.shippingMethods[0]?.id ?? '',
    );

    setSelectedItemIds(nextSelectedIds);
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

  /**
   * Chuyển đổi trạng thái chọn tất cả sản phẩm
   */
  const toggleSelectAll = () => {
    if (allPurchasableSelected) {
      setSelectedItemIds([]);
      return;
    }
    setSelectedItemIds(purchasableItems.map((item) => item.id));
  };

  /**
   * Chọn hoặc bỏ chọn một sản phẩm cụ thể
   * @param {string|number} itemId - ID sản phẩm
   */
  const toggleItem = (itemId) => {
    setSelectedItemIds((previousIds) => {
      if (previousIds.includes(itemId)) {
        return previousIds.filter((id) => id !== itemId);
      }
      return [...previousIds, itemId];
    });
  };

  /**
   * Cập nhật số lượng của một sản phẩm, không vượt quá tồn kho hiện tại
   * @param {string|number} itemId - ID sản phẩm
   * @param {number} nextQuantity - Số lượng mới muốn thay đổi
   */
  const changeItemQuantity = (itemId, nextQuantity) => {
    setItems((previousItems) =>
      previousItems.map((item) => {
        if (item.id !== itemId) {
          return item;
        }
        const boundedQuantity = Math.max(1, Math.min(nextQuantity, item.stockQuantity));
        return {
          ...item,
          quantity: boundedQuantity,
        };
      }),
    );
  };

  /**
   * Thêm sản phẩm hoặc mẫu mã mới vào giỏ hàng với kiểm tra ràng buộc tồn kho nghiêm ngặt.
   * - Nếu mẫu mã không hoạt động hoặc hết hàng (stockQuantity <= 0): Từ chối thêm.
   * - Nếu đã có trong giỏ: Cộng dồn số lượng nhưng không vượt quá tồn kho (stockQuantity).
   * - Nếu chưa có: Thêm dòng mới với số lượng ban đầu tối đa bằng tồn kho hiện có.
   * @param {Object} newItem - Thông tin sản phẩm/mẫu mã muốn thêm
   */
  const addToCart = (newItem) => {
    // 1. Kiểm tra tính khả dụng cơ bản (hoạt động và còn hàng)
    if (!newItem.isActive || newItem.stockQuantity <= 0) {
      setCartAlert({
        title: 'Thông báo lỗi',
        message: `Sản phẩm mẫu mã ${newItem.sku} đã hết hàng hoặc ngừng kinh doanh!`,
        type: 'danger',
      });
      return;
    }

    setItems((previousItems) => {
      // 2. Tìm xem mẫu mã này đã có trong giỏ chưa
      // XỬ LÝ VẤN ĐỀ KHÁC MẪU MÃ: Nếu cùng một sản phẩm (productId) nhưng khác màu, khác size (khác variantId hoặc sku)
      // thì sẽ không được gộp chung mà sẽ thêm thành một dòng mới riêng biệt trong giỏ hàng.
      const existingIndex = previousItems.findIndex(
        (item) => {
          // Kiểm tra xem có trùng chính xác mẫu mã không (ưu tiên so sánh bằng variantId hoặc sku)
          const isSameVariant = item.variantId && newItem.variantId && item.variantId === newItem.variantId;
          const isSameSku = item.sku && newItem.sku && item.sku === newItem.sku;
          
          // Fallback: nếu không có variantId/sku, kiểm tra trùng productId và trùng cả màu sắc lẫn kích thước
          const isSameAttributes = item.productId === newItem.productId 
                                   && item.color === newItem.color 
                                   && item.size === newItem.size;

          return isSameVariant || isSameSku || isSameAttributes;
        }
      );

      if (existingIndex !== -1) {
        // 3. Nếu đã tồn tại, kiểm tra xem đã chạm giới hạn tồn kho chưa
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
            // Cộng dồn nhưng không được vượt quá số lượng tồn kho của mẫu mã đó
            const newQty = Math.min(item.quantity + addedQty, item.stockQuantity);
            return { ...item, quantity: newQty };
          }
          return item;
        });
      }

      // 4. Nếu chưa tồn tại, thêm dòng mới với số lượng được giới hạn bởi tồn kho
      const newId = previousItems.length > 0 ? Math.max(...previousItems.map((i) => i.id)) + 1 : 1001;
      const initialQty = Math.min(newItem.quantity || 1, newItem.stockQuantity);
      
      const createdItem = {
        id: newId,
        cartItemId: newId,
        ...newItem,
        quantity: initialQty, // Đảm bảo số lượng khởi tạo không vượt tồn kho
      };

      // Tự động tích chọn dòng mới thêm
      setSelectedItemIds((prevSelected) => [...prevSelected, newId]);

      return [...previousItems, createdItem];
    });
  };

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * @param {string|number} itemId - ID sản phẩm cần xoá
   */
  const removeItem = (itemId) => {
    setItems((previousItems) => previousItems.filter((item) => item.id !== itemId));
    setSelectedItemIds((previousIds) => previousIds.filter((id) => id !== itemId));
  };

  /**
   * Xoá toàn bộ các sản phẩm không khả dụng (hết hàng, đã ẩn)
   */
  const clearUnavailableItems = () => {
    setItems((previousItems) => previousItems.filter(isPurchasable));
  };

  /**
   * Kiểm tra và áp dụng mã giảm giá
   */
  const applyVoucher = () => {
    const code = voucherInput.trim().toUpperCase();

    if (!code) {
      setVoucherApplied(null);
      setVoucherNotice('Đã xoá mã giảm giá.');
      return;
    }

    const matched = voucherCatalog[code];
    if (!matched) {
      setVoucherApplied(null);
      setVoucherNotice('Mã giảm giá không hợp lệ. Thử lại với FREESHIP30, SALE40K hoặc SAVE10.');
      return;
    }

    setVoucherApplied(matched);
    setVoucherNotice(`Đã áp dụng ${matched.code}: ${matched.description}`);
  };

  /**
   * Tải lại toàn bộ giỏ hàng, xoá bỏ các mã giảm giá và ghi chú đang có
   */
  const reloadCart = async () => {
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

  /**
   * Xử lý hành động thanh toán. Kiểm tra tồn kho trước khi chốt đơn.
   */
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

      setCheckoutNotice('Tồn kho đã được kiểm tra lại. Dữ liệu giỏ hàng hiện đã sẵn sàng để tạo đơn.');
    } catch (_error) {
      setCheckoutNotice('Không thể xác thực tồn kho lúc này. Vui lòng thử lại.');
    } finally {
      setCheckingOut(false);
    }
  };

  /**
   * Thêm địa chỉ giao hàng mới (Mock)
   * @param {Object} newAddress - Thông tin địa chỉ mới
   */
  const addAddress = (newAddress) => {
    setAddresses((prevAddresses) => {
      const newId = prevAddresses.length > 0 ? Math.max(...prevAddresses.map((a) => a.id)) + 1 : 301;
      const addressToAdd = { ...newAddress, id: newId };
      
      let nextAddresses = [...prevAddresses];
      
      if (addressToAdd.isDefault) {
        // Nếu chọn làm mặc định, bỏ mặc định các địa chỉ cũ
        nextAddresses = nextAddresses.map(addr => ({ ...addr, isDefault: false }));
      }
      
      nextAddresses.push(addressToAdd);
      
      // Tự động chọn địa chỉ vừa thêm
      setSelectedAddressId(newId);
      
      return nextAddresses;
    });
  };

  return {
    // State
    loading,
    errorMessage,
    items,
    addresses,
    shippingMethods,
    selectedAddressId,
    selectedShippingId,
    selectedItemIds,
    voucherInput,
    voucherNotice,
    orderNote,
    stockSyncNotice,
    lastSyncedAt,
    checkoutNotice,
    checkingOut,
    cartAlert,

    // Computed
    purchasableItems,
    unavailableCount,
    totals,
    canCheckout,
    allPurchasableSelected,
    selectedAddress,

    // Actions (Setters / Handlers)
    setSelectedAddressId,
    setSelectedShippingId,
    setVoucherInput,
    setOrderNote,
    toggleSelectAll,
    toggleItem,
    changeItemQuantity,
    addToCart,
    removeItem,
    clearUnavailableItems,
    applyVoucher,
    reloadCart,
    handleCheckout,
    setCartAlert,
    addAddress,
  };
}
