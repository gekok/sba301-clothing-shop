import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Bọc Provider ngay tại file router này thay vì App.jsx
import { ReviewProviderDemo } from './ReviewContextDemo.jsx';
import OrderListDemo from './OrderListDemo.jsx';
import OrderDetailDemo from './OrderDetailDemo.jsx';
import ReviewSuccessDemo from './ReviewSuccessDemo.jsx';
import ProductDetailDemo from './ProductDetailDemo.jsx';

export default function ReviewDemoRouter() {
  return (
    <ReviewProviderDemo>
      <Routes>
        <Route path="/" element={<OrderListDemo />} />
        <Route path="order/:orderCode" element={<OrderDetailDemo />} />
        <Route path="order/:orderCode/success" element={<ReviewSuccessDemo />} />
        <Route path="product/:productId" element={<ProductDetailDemo />} />
      </Routes>
    </ReviewProviderDemo>
  );
}