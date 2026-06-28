import { Card, Col, Container, Row } from 'react-bootstrap';
import { ArrowRight } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

const CategoryShowcase = ({ categories }) => (
    <section className="py-5">
        <Container>
            <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
                <div>
                    <h2 className="home-section-title mb-2">Danh mục nổi bật</h2>
                    <p className="home-section-subtitle mb-0">Khám phá theo phong cách bạn yêu thích</p>
                </div>
                <Link to="/products" className="text-dark text-decoration-none fw-medium">
                    Xem tất cả <ArrowRight className="ms-1" />
                </Link>
            </div>

            <Row className="g-4">
                {categories.map((category) => (
                    <Col key={category.label} md={4}>
                        <Card as={Link} to={category.to} className="home-category-card text-decoration-none">
                            <img src={category.image} alt={category.label} loading="lazy" />
                            <div className="home-category-overlay">
                                <h3 className="h4 fw-semibold mb-1">{category.label}</h3>
                                <p className="small mb-0 opacity-75">{category.description}</p>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    </section>
);

export default CategoryShowcase;