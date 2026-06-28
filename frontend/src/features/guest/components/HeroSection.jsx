import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HeroSection = () => (
    <section className="home-hero">
        <Container>
            <div className="py-5">
                <p className="home-hero-kicker mb-3">Bộ sưu tập mùa mới</p>
                <h1 className="home-hero-title mb-3">Thời trang trẻ trung</h1>
                <p className="home-hero-desc mb-4">
                    Phong cách hiện đại, giá hợp lý — chọn outfit phù hợp mỗi ngày.
                </p>
                <div className="d-flex flex-wrap gap-3">
                    <Button as={Link} to="/products" variant="light" size="lg" className="px-4 rounded-0">
                        Shop Now
                    </Button>
                    <Button
                        as={Link}
                        to="/products?sort=new"
                        variant="outline-light"
                        size="lg"
                        className="px-4 rounded-0"
                    >
                        Xem hàng mới
                    </Button>
                </div>
            </div>
        </Container>
    </section>
);

export default HeroSection;