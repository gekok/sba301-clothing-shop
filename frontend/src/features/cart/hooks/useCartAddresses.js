import { useState, useMemo } from 'react';
import { addAddressAPI } from '../services/cartService.js';

export function useCartAddresses({ setCartAlert }) {
  const [addresses, setAddresses] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedShippingId, setSelectedShippingId] = useState('standard');
  const [isUpdatingAddresses, setIsUpdatingAddresses] = useState(false);

  const addAddress = async (newAddress) => {
    setIsUpdatingAddresses(true);
    try {
      const response = await addAddressAPI(newAddress);
      const addressToAdd = response.data; // Server trả về kèm ID thật
      
      setAddresses((prevAddresses) => {
        let nextAddresses = [...prevAddresses];
        
        if (addressToAdd.isDefault) {
          nextAddresses = nextAddresses.map(addr => ({ ...addr, isDefault: false }));
        }
        
        nextAddresses.push(addressToAdd);
        setSelectedAddressId(addressToAdd.id);
        return nextAddresses;
      });
    } catch (error) {
      setCartAlert({
        title: 'Lỗi',
        message: 'Không thể thêm địa chỉ lúc này. Vui lòng thử lại.',
        type: 'danger',
      });
    } finally {
      setIsUpdatingAddresses(false);
    }
  };

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const selectedShippingMethod = useMemo(
    () => shippingMethods.find((method) => method.id === selectedShippingId) ?? null,
    [shippingMethods, selectedShippingId],
  );

  return {
    addresses,
    setAddresses,
    shippingMethods,
    setShippingMethods,
    selectedAddressId,
    setSelectedAddressId,
    selectedShippingId,
    setSelectedShippingId,
    selectedAddress,
    selectedShippingMethod,
    isUpdatingAddresses,
    addAddress,
  };
}
