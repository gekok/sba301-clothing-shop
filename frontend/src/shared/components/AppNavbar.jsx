import { Link } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';

// Thanh điều hướng dùng chung cho toàn app — render trong MainLayout nên hiện trên mọi trang.
const AppNavbar = () => {
  return (
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
  );
};

export default AppNavbar;
