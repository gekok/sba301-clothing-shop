import { Routes, Route, Link } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';

import Home from './pages/customer/Home.jsx';
import ProductList from './pages/customer/ProductList.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import OrderManagement from './pages/admin/OrderManagement.jsx';
import AuditLogs from './pages/admin/AuditLogs.jsx';
import POS from './pages/staff/POS.jsx';
import Cart from './components/cart/Cart';

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
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/orders" element={<OrderManagement />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
          <Route path="/staff/pos" element={<POS />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
