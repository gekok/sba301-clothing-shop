import { Routes, Route, Link } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';

import Home from '../features/home/pages/Home.jsx';
import ProductList from '../features/products/pages/ProductList.jsx';
import Dashboard from '../features/dashboard/pages/Dashboard.jsx';
import OrderManagement from '../features/orders/pages/OrderManagement.jsx';
import AuditLogs from '../features/audit-logs/pages/AuditLogs.jsx';
import POS from '../features/pos/pages/POS.jsx';
import Cart from '../features/cart/components/CartExperience/CartExperience.jsx';
import Login from '../features/auth/pages/Login.jsx';
import Register from '../features/auth/pages/Register.jsx';

import OrderListDemo from '../features/reviews/demo/OrderListDemo.jsx';
import OrderDetailDemo from '../features/reviews/demo/OrderDetailDemo.jsx';
import ReviewSuccessDemo from '../features/reviews/demo/ReviewSuccessDemo.jsx';
import ProductDetailDemo from '../features/reviews/demo/ProductDetailDemo.jsx';

function App() {
  return (
    <>
      <Navbar bg="dark" variant="dark" expand="md">
        <Container>
          <Navbar.Brand as={Link} to="/">SBA301 Shop</Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
              <Nav.Link as={Link} to="/products">Sản phẩm</Nav.Link>
              <Nav.Link as={Link} to="/cart">Giỏ hàng</Nav.Link>
              <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
              <Nav.Link as={Link} to="/admin/orders">Quản lý đơn</Nav.Link>
              <Nav.Link as={Link} to="/admin/audit-logs">Nhật ký</Nav.Link>
              <Nav.Link as={Link} to="/staff/pos">Staff POS</Nav.Link>
              <Nav.Link as={Link} to="/login">Đăng nhập</Nav.Link>
              <Nav.Link as={Link} to="/register">Đăng ký</Nav.Link>
              <Nav.Link as={Link} to="/demo" className="text-warning fw-medium">Đánh giá (Demo)</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-4">
        <Routes>
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
        </Routes>
      </Container>
    </>
  );
}

export default App;