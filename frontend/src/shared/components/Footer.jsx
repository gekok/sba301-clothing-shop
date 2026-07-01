import { Container } from 'react-bootstrap';
import '../../shared/styles/layout.css';

const Footer = () => (
  <footer className="store-footer mt-auto">
    <Container className="py-4">
      <div className="text-center small">
        <span>&copy; {new Date().getFullYear()} SBA301 Shop</span>
      </div>
    </Container>
  </footer>
);

export default Footer;
