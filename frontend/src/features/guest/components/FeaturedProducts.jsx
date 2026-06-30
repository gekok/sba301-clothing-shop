import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { ArrowRight } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { formatVND } from '../../../shared/utils/format.js';
import { getLowestPrice } from '../utils/home.util.js';

const FeaturedProducts = ({ products, productImages }) => (
    <section className="py-5">
        <Container>
            <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
                <div>
                    <h2 className="home-section-title mb-2">Sản phẩm nổi bật</h2>
                    <p className="home-section-subtitle mb-0">Được yêu thích nhất tuần này</p>
                </div>
                <Link to="/products" className="text-dark text-decoration-none fw-medium">
                    Xem tất cả <ArrowRight className="ms-1" />
                </Link>
            </div>

            <Row className="g-4">
                {products.map((product, index) => (
                    <Col key={product.id} md={4}>
                        <Card className="home-product-card h-100 shadow-sm">
                            <div className="position-relative">
                                <Card.Img
                                    variant="top"
                                    src={productImages[product.id]}
                                    alt={product.name}
                                    className="home-product-image"
                                    loading="lazy"
                                />
                                {index === 0 && <span className="home-product-badge">Best seller</span>}
                            </div>
                            <Card.Body className="d-flex flex-column">
                                <Card.Text className="text-muted text-uppercase small mb-1">
                                    {product.category}
                                </Card.Text>
                                <Card.Title className="fs-6 fw-semibold mb-2">{product.name}</Card.Title>
                                <Card.Text className="fw-semibold mb-3">
                                    {formatVND(getLowestPrice(product))}
                                </Card.Text>
                                <Button
                                    as={Link}
                                    to={`/products/${product.id}`}
                                    variant="outline-dark"
                                    className="mt-auto rounded-0"
                                    size="sm"
                                >
                                    Xem chi tiết
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    </section>
);

export default FeaturedProducts;