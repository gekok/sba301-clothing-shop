import React, { useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { initialOrders, initialCommunityReviews } from '../../components/ReviewDemoFeature/mockData';

// Khai báo import các mảng giao diện đã bẻ vụn
import OrderHistoryTable from '../../components/ReviewDemoFeature/OrderHistoryTable';
import ReviewForm from '../../components/ReviewDemoFeature/ReviewForm';
import ReviewSuccess from '../../components/ReviewDemoFeature/ReviewSuccess';
import CommunityReviews from '../../components/ReviewDemoFeature/CommunityReviews';
import CompletedReviews from '../../components/ReviewDemoFeature/CompletedReviews';

export default function ReviewDemo() {
  const [orders, setOrders] = useState(initialOrders);
  const [communityReviews, setCommunityReviews] = useState(initialCommunityReviews);
  const [currentScreen, setCurrentScreen] = useState('LIST'); // 'LIST' | 'WRITING' | 'SUCCESS'
  const [selectedOrder, setSelectedOrder] = useState(orders[2]);

  const [inputRating, setInputRating] = useState(5);
  const [inputComment, setInputComment] = useState("Tuyệt vời, tất rất rất êm chân, kháng khuẩn tốt, sẽ mua thêm.");
  const [starFilter, setStarFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST');

  const handleActionClick = (order) => {
    setSelectedOrder(order);
    if (order.status === 'pending') {
      setInputRating(5);
      setInputComment("Tuyệt vời, tất rất rất êm chân, kháng khuẩn tốt, sẽ mua thêm.");
      setCurrentScreen('WRITING');
    } else {
      setInputRating(order.rating);
      setInputComment(order.comment);
      setCurrentScreen('SUCCESS');
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    setOrders(orders.map(o => o.orderCode === selectedOrder.orderCode ? { ...o, status: 'reviewed', rating: inputRating, comment: inputComment, date: "31/5/2026" } : o));
    setCommunityReviews([{ id: Date.now(), fullName: "Bạn (Người dùng Demo)", rating: inputRating, date: "31/5/2026", variantInfo: selectedOrder.variantInfo, comment: inputComment }, ...communityReviews]);
    setCurrentScreen('SUCCESS');
  };

  return (
    <div className="bg-light p-3 rounded-3">
      {/* 1. Khu vực bảng lịch sử đơn hàng luôn hiển thị ở trên cùng */}
      <OrderHistoryTable 
        orders={orders} selectedOrder={selectedOrder} 
        currentScreen={currentScreen} onActionClick={handleActionClick} 
      />

      {/* Phân vùng Layout 2 cột */}
      <Row className="g-4">
        {/* CỘT TRÁI (CHIẾM 7 PHẦN): Chứa các màn hình trạng thái tương tác */}
        <Col lg={7} md={12}>
          {currentScreen === 'LIST' && (
            <Card className="border-0 p-5 text-center text-muted bg-white rounded-3 shadow-sm">
              <p className="mb-0 small fw-medium py-3">💡 Chọn một tác vụ ở bảng danh sách trên để mở luồng demo!</p>
            </Card>
          )}

          {currentScreen === 'WRITING' && (
            <ReviewForm 
              selectedOrder={selectedOrder} rating={inputRating} setRating={setInputRating}
              comment={inputComment} setComment={setInputComment} 
              onSubmit={handleSubmitReview} onCancel={() => setCurrentScreen('LIST')}
            />
          )}

          {currentScreen === 'SUCCESS' && (
            <ReviewSuccess 
              selectedOrder={selectedOrder} rating={inputRating} 
              comment={inputComment} onBackToProducts={() => setCurrentScreen('LIST')}
            />
          )}

          {/* List cộng đồng luôn nằm dưới cột trái */}
          <CommunityReviews 
            reviews={communityReviews} starFilter={starFilter} 
            setStarFilter={setStarFilter} sortOrder={sortOrder} setSortOrder={setSortOrder}
          />
        </Col>

        {/* CỘT PHẢI (CHIẾM 5 PHẦN): Các feedback đã xong */}
        <Col lg={5} md={12}>
          <CompletedReviews orders={orders} onEditClick={handleActionClick} />
        </Col>
      </Row>
    </div>
  );
}