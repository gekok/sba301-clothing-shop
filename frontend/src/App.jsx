import { Routes, Route, Link } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';

import Home from './pages/customer/Home.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import POS from './pages/staff/POS.jsx';

import OrderListDemo from './review-demo/OrderListDemo.jsx';
import OrderDetailDemo from './review-demo/OrderDetailDemo.jsx';
import ReviewSuccessDemo from './review-demo/ReviewSuccessDemo.jsx';
import ProductDetailDemo from './review-demo/ProductDetailDemo.jsx';

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
              <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
              <Nav.Link as={Link} to="/staff/pos">Staff POS</Nav.Link>
              <Nav.Link as={Link} to="/demo" className="text-warning fw-medium">Đánh giá (Demo)</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-4">
        <Routes>
          {/* Các trang gốc của dự án */}
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/staff/pos" element={<POS />} />

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