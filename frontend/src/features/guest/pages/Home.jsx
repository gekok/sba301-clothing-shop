import { Card, Row, Col } from 'react-bootstrap';

function Home() {
  return (
    <>
      <h1 className="mb-4">Trang chủ — SBA301 Clothing Shop</h1>
      <p className="text-muted">Placeholder. Sau này hiển thị danh sách sản phẩm theo category.</p>

      <Row className="g-3 mt-2">
        {[1, 2, 3].map((i) => (
          <Col key={i} md={4}>
            <Card>
              <Card.Body>
                <Card.Title>Sản phẩm mẫu #{i}</Card.Title>
                <Card.Text className="text-muted">Mô tả ngắn.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}

export default Home;
