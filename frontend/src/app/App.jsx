import { Routes, Route } from 'react-router-dom';

import MainLayout from './layout/MainLayout';

import Home from '../features/home/pages/Home.jsx';
import ProductList from '../features/products/pages/ProductList.jsx';
import Dashboard from '../features/dashboard/pages/Dashboard.jsx';
import OrderManagement from '../features/orders/pages/OrderManagement.jsx';
import AuditLogs from '../features/audit-logs/pages/AuditLogs.jsx';
import POS from '../features/pos/pages/POS.jsx';
import Cart from '../features/cart/components/Cart';
import Login from '../features/auth/pages/Login.jsx';
import Register from '../features/auth/pages/Register.jsx';

import OrderListDemo from '../features/reviews/demo/OrderListDemo.jsx';
import OrderDetailDemo from '../features/reviews/demo/OrderDetailDemo.jsx';
import ReviewSuccessDemo from '../features/reviews/demo/ReviewSuccessDemo.jsx';
import ProductDetailDemo from '../features/reviews/demo/ProductDetailDemo.jsx';

function App() {
  return (
    <Routes>
      {/* Mọi trang đi qua MainLayout để giữ navbar + container dùng chung */}
      <Route element={<MainLayout />}>
        {/* Các trang gốc của dự án */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/orders" element={<OrderManagement />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />
        <Route path="/staff/pos" element={<POS />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/demo" element={<OrderListDemo />} />
        <Route path="/demo-order/:orderCode" element={<OrderDetailDemo />} />
        <Route path="/demo-order/:orderCode/success" element={<ReviewSuccessDemo />} />
        <Route path="/demo-product/:productId" element={<ProductDetailDemo />} />
      </Route>
    </Routes>
  );
}

export default App;
