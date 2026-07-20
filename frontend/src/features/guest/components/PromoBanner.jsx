import { Button, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const PromoBanner = () => (
    <section className="home-promo-banner">
        <Container>
            <Row className="align-items-center g-4">
                <Col lg={7}>
                    <p className="text-uppercase small mb-2 opacity-75">Ưu đãi có hạn</p>
                    <h2 className="display-6 fw-bold mb-3">Giảm đến 30% cho áo &amp; phụ kiện</h2>
                    <p className="mb-4 opacity-75">
                        Áp dụng cho đơn online — nhập mã SAVE10 khi thanh toán.
                    </p>
                    <Button as={Link} to="/products?sort=sale" variant="light" className="rounded-0 px-4">
                        Mua sale ngay
                    </Button>
                </Col>
            </Row>
        </Container>
    </section>
);

export default PromoBanner;