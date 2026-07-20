import { Container, Row, Col } from 'react-bootstrap';

const TrustBadges = ({ badges }) => (
    <section className="py-5 border-bottom">
        <Container>
            <Row className="g-3">
                {badges.map((badge) => (
                    <Col key={badge.title} xs={6} lg={3}>
                        <div className="home-trust-badge">
                            <div className="home-trust-badge-title">{badge.title}</div>
                            <p className="home-trust-badge-subtitle">{badge.description}</p>
                        </div>
                    </Col>
                ))}
            </Row>
        </Container>
    </section>
);

export default TrustBadges;