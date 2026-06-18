import React, { createContext, useContext, useState } from 'react';

const ReviewContext = createContext();

export function ReviewProviderDemo({ children }) {
  const [currentUser] = useState({ fullName: "Bạn (Người dùng Thử nghiệm)" });

  // Mock sản phẩm demo
  const [products] = useState({
    "PROD-DEMO": { id: "PROD-DEMO", name: "Tất thể thao cổ trung cao cấp Cotton dệt tổ ong thoáng khí (Bản Thử Nghiệm)" }
  });

  // Quản lý trạng thái các đơn hàng test
  const [orders, setOrders] = useState({
    "ORD-101": { orderCode: "ORD-101", productId: "PROD-DEMO", productName: "Tất thể thao cổ trung cao cấp", variantInfo: "Màu Trắng / Size L", status: "reviewed", isReviewed: true, rating: 5, comment: "Vải dày dặn, co giãn cực kỳ tốt, đi cả ngày không hôi chân.", date: "28/5/2026" },
    "ORD-102": { orderCode: "ORD-102", productId: "PROD-DEMO", productName: "Tất thể thao cổ trung cao cấp", variantInfo: "Màu Đen / Size M", status: "reviewed", isReviewed: true, rating: 5, comment: "Giao hàng nhanh, tất màu đen ôm chân rất đẹp, chất vải mềm mại.", date: "29/5/2026" },
    "ORD-103": { orderCode: "ORD-103", productId: "PROD-DEMO", productName: "Tất thể thao cổ trung cao cấp", variantInfo: "Màu Xám / Size L", status: "pending", isReviewed: false, rating: 0, comment: "", date: "" }
  });

  // Danh sách đánh giá cộng đồng
  const [reviews, setReviews] = useState([
    { id: 1, productId: "PROD-DEMO", user: { fullName: "Nguyễn Văn Đạt" }, rating: 5, variantInfo: "Màu Đen / Size M", comment: "Sản phẩm đóng gói rất cẩn thận. Vải tất dày dặn sờ rất sướng tay, dùng đi đá bóng cực kỳ êm chân.", createdAt: "2026-05-30T10:00:00.000Z" },
    { id: 2, productId: "PROD-DEMO", user: { fullName: "Trần Thị Mai" }, rating: 4, variantInfo: "Màu Trắng / Size L", comment: "Tất đi êm, thấm hút mồ hôi tương đối tốt, đóng gói đẹp nhưng shipper giao hơi muộn xíu.", createdAt: "2026-05-29T14:30:00.000Z" }
  ]);

  const addReview = (newReview, orderCode) => {
    setReviews([newReview, ...reviews]);
    setOrders(prev => ({
      ...prev,
      [orderCode]: {
        ...prev[orderCode],
        status: 'reviewed',
        isReviewed: true,
        rating: newReview.rating,
        comment: newReview.comment,
        date: "31/5/2026"
      }
    }));
  };

  const updateReviewByOrder = (productId, variantInfo, updatedComment) => {
    setReviews(prev => prev.map(r => (r.productId === productId && r.variantInfo === variantInfo) ? { ...r, comment: updatedComment } : r));
    const matchedOrderKey = Object.keys(orders).find(key => orders[key].productId === productId && orders[key].variantInfo === variantInfo);
    if (matchedOrderKey) {
      setOrders(prev => ({
        ...prev,
        [matchedOrderKey]: { ...prev[matchedOrderKey], comment: updatedComment }
      }));
    }
  };

  return (
    <ReviewContext.Provider value={{ currentUser, products, orders, reviews, addReview, updateReviewByOrder }}>
      {children}
    </ReviewContext.Provider>
  );
}

export const useReviewSystemDemo = () => useContext(ReviewContext);