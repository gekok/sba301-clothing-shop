# GIẢI THÍCH CHI TIẾT FILE FRONTEND: CustomerProductDetail.jsx

- **Đường dẫn tương đối:** `frontend/src/features/products/pages/CustomerProductDetail.jsx`
- **Chức năng:** Trang xem chi tiết sản phẩm khách mua tại `/products/:id`, chọn Size/Màu sắc, số lượng và bấm "Thêm vào giỏ hàng" hoặc "Mua ngay".

---

## MÃ NGUỒN VÀ GIẢI THÍCH CHI TIẾT TỪNG ĐOẠN

```jsx
// Lấy param ID sản phẩm từ URL (VD: /products/1 -> id = 1)
const { id } = useParams();

// State chọn Màu sắc, Size và Số lượng
const [selectedColor, setSelectedColor] = useState('');
const [selectedSize, setSelectedSize] = useState('');
const [quantity, setQuantity] = useState(1);

// Helper lọc sửa lỗi mã hóa Unicode tiếng Việt (VD: Tr?ng -> Trắng)
const formatColor = (color) => {
  if (!color) return '';
  return color.replace(/Tr\?ng/gi, 'Trắng');
};

// useMemo bóc tách danh sách Màu sắc không trùng lặp từ mảng variants
const availableColors = useMemo(() => {
  if (!product?.variants) return [];
  return Array.from(new Set(product.variants.map(v => formatColor(v.color)))).filter(Boolean);
}, [product]);

// useMemo lọc danh sách Size tương ứng với Màu sắc đang được chọn
const availableSizes = useMemo(() => {
  if (!product?.variants || !selectedColor) return [];
  return product.variants
    .filter(v => formatColor(v.color) === selectedColor)
    .map(v => v.size)
    .filter(Boolean);
}, [product, selectedColor]);

// Tìm biến thể Variant khớp chính xác cặp (selectedColor, selectedSize)
const selectedVariant = useMemo(() => {
  if (!product?.variants) return null;
  return product.variants.find(
    v => formatColor(v.color) === selectedColor && v.size === selectedSize
  );
}, [product, selectedColor, selectedSize]);

// Hàm xử lý Thêm vào giỏ hàng
const handleAddToCart = async (redirectCheckout = false) => {
  if (!selectedVariant) return alert('Vui lòng chọn đầy đủ Màu sắc và Kích cỡ.');

  try {
    setAddingToCart(true);
    // Gọi API POST /api/v1/carts/items gửi { variantId, quantity }
    await addItemAPI({
      variantId: selectedVariant.id,
      quantity: quantity
    });

    // Bắn sự kiện custom cartUpdated để Header lắng nghe và nhảy số giỏ hàng lập tức
    window.dispatchEvent(new Event('cartUpdated'));

    if (redirectCheckout) {
      navigate('/cart'); // Nếu bấm Mua Ngay -> Chuyển sang giỏ hàng
    } else {
      setShowToast(true); // Nếu bấm Thêm vào giỏ -> Hiện Toast đen thông báo nổi
    }
  } catch (err) {
    alert(err.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng.');
  } finally {
    setAddingToCart(false);
  }
};
```
