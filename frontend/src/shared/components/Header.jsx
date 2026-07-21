import { useEffect, useState } from 'react';
import {
  Accordion,
  Container,
  Form,
  Offcanvas,
} from 'react-bootstrap';
import { Bag, List, Person, Search, X } from 'react-bootstrap-icons';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clearAuthState, getAuthState } from '../utils/auth';
import { getCartSnapshot } from '../../features/cart/services/cartService.js';
import '../styles/layout.css';

const SITE_NAME = 'SBA301 Shop';

const ANNOUNCEMENT = {
  message: 'Miễn phí vận chuyển cho đơn từ 499.000đ · Đổi trả trong 7 ngày',
  link: '/products',
  linkLabel: 'Mua ngay',
};

const STORE_NAV_BEFORE_PRODUCTS = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Giới thiệu', to: '/about' },
];

const STORE_NAV_AFTER_PRODUCTS = [
  { label: 'Liên hệ', to: '/contact' },
  { label: 'Khuyến mãi', to: '/products?sort=sale', highlight: true },
];

const SHOP_CATEGORIES = [
  {
    label: 'Tất cả sản phẩm',
    to: '/products',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80',
    description: 'Xem toàn bộ bộ sưu tập',
  },
  {
    label: 'Áo',
    to: '/products?category=ao',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
    description: 'Thun, sơ mi, hoodie, khoác',
  },
  {
    label: 'Quần',
    to: '/products?category=quan',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80',
    description: 'Jean, kaki, jogger, short',
  },
  {
    label: 'Phụ kiện',
    to: '/products?category=phu-kien',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    description: 'Túi, mũ, thắt lưng',
  },
];

const GUEST_ACCOUNT_MENU = [
  { label: 'Đăng nhập', to: '/login' },
  { label: 'Đăng ký', to: '/register' },
];

const getAccountMenu = (isAuthenticated, role) => {
  if (!isAuthenticated) {
    return {
      account: GUEST_ACCOUNT_MENU,
      portal: [],
    };
  }

  const account = [
    { label: 'Thông tin cá nhân', to: '/account' },
    { label: 'Đơn hàng của tôi', to: '/orders' },
    { label: 'Sổ địa chỉ', to: '/account/addresses' },
  ];

  const portal = [];

  if (role === 'ADMIN') {
    portal.push(
      { label: 'Dashboard', to: '/admin/dashboard' },
      { label: 'Quản lý sản phẩm', to: '/admin/products' },
      { label: 'Quản lý đơn hàng', to: '/admin/orders' },
      { label: 'Nhật ký hệ thống', to: '/admin/audit-logs' },
    );
  }

  if (role === 'STAFF') {
    portal.push(
      { label: 'Bán hàng POS', to: '/staff/pos' },
      { label: 'Quản lý đơn hàng', to: '/admin/orders' },
    );
  }

  return { account, portal };
};

// Lấy số lượng item trong giỏ từ nguồn dữ liệu thật (giống CartExperience: getCartSnapshot() -> /carts/me),
// KHÔNG đọc localStorage vì không có chỗ nào trong app ghi giỏ hàng vào đó.
const getCartCount = async () => {
  try {
    const snapshot = await getCartSnapshot();
    return snapshot.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  } catch {
    return 0;
  }
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);
  const [authState, setAuthStateLocal] = useState(getAuthState());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { account: accountLinks, portal: portalLinks } = getAccountMenu(
    authState.isAuthenticated,
    authState.role,
  );

  // Sync auth khi navigate (đăng nhập/đăng xuất ở trang khác)
  useEffect(() => {
    setAuthStateLocal(getAuthState());
  }, [location.pathname]);

  // Đóng tất cả panel khi chuyển trang
  useEffect(() => {
    setSearchOpen(false);
    setMobileMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Tải + đồng bộ số lượng giỏ hàng thật từ server, khi mount và khi có thay đổi
  // (cart:updated được useCartItems dispatch sau khi add/update/remove thành công).
  useEffect(() => {
    let mounted = true;
    const syncCartCount = () => {
      getCartCount().then((count) => {
        if (mounted) setCartCount(count);
      });
    };

    syncCartCount();
    window.addEventListener('cart:updated', syncCartCount);
    return () => {
      mounted = false;
      window.removeEventListener('cart:updated', syncCartCount);
    };
  }, []);

  // Bắt 401 từ axios interceptor → force logout
  useEffect(() => {
    const onForceLogout = () => {
      clearAuthState();
      setAuthStateLocal(getAuthState());

      // Đồng bộ badge với dữ liệu thực từ server
      getCartCount().then(setCartCount);

      navigate('/login');
    };

    window.addEventListener('auth:logout', onForceLogout);

    return () => {
      window.removeEventListener('auth:logout', onForceLogout);
    };
  }, [navigate]);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setAccountOpen(false);
    setSearchOpen(false);
  };

  const handleLogout = () => {
    clearAuthState();
    setAuthStateLocal(getAuthState());
    closeMenus();
    navigate('/');
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : '/products');
    closeMenus();
  };

  const handleCartClick = () => {
    closeMenus();
  };

  const renderAccountPanel = () => (
    <div className="store-account-panel">
      <div className="store-account-panel__head">
        <div className="store-account-panel__email">{authState.email || 'Tài khoản'}</div>
        <span className="store-account-panel__role">{authState.role || 'USER'}</span>
      </div>

      <nav className="store-account-panel__nav">
        {accountLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="store-account-panel__link"
            onClick={closeMenus}
          >
            {item.label}
          </Link>
        ))}

        {portalLinks.length > 0 && (
          <>
            <div className="store-account-panel__divider" />
            <div className="store-account-panel__section-label">Khu vực làm việc</div>
            {portalLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="store-account-panel__link store-account-panel__link--portal"
                onClick={closeMenus}
              >
                {item.label}
              </Link>
            ))}
          </>
        )}

        <div className="store-account-panel__divider" />
        <button type="button" className="store-account-panel__logout" onClick={handleLogout}>
          Đăng xuất
        </button>
      </nav>
    </div>
  );

  const renderGuestPanel = () => (
    <div className="store-account-panel store-account-panel--guest">
      <nav className="store-account-panel__nav">
        {accountLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="store-account-panel__link"
            onClick={closeMenus}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <header className={`store-header sticky-top ${scrolled ? 'store-header--scrolled' : ''}`}>
      <div className="store-header__promo">
        <Container className="store-header__promo-inner">
          <span>{ANNOUNCEMENT.message}</span>
          <Link to={ANNOUNCEMENT.link} onClick={closeMenus}>
            {ANNOUNCEMENT.linkLabel}
          </Link>
        </Container>
      </div>

      <div className="store-header__bar">
        <Container className="store-header__bar-inner">
          <button
            type="button"
            className="store-header__icon-btn d-xl-none"
            aria-label="Mở menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <List size={22} />
          </button>

          <Link to="/" className="store-header__logo" onClick={closeMenus}>
            {SITE_NAME}
          </Link>

          <nav className="store-header__nav d-none d-xl-flex" aria-label="Điều hướng chính">
            {STORE_NAV_BEFORE_PRODUCTS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  ['store-header__nav-link', isActive ? 'is-active' : ''].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="store-header__nav-item store-header__nav-item--mega">
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  ['store-header__nav-link', isActive ? 'is-active' : ''].join(' ')
                }
              >
                Sản phẩm
              </NavLink>

              <div className="store-mega-menu">
                <Container>
                  <div className="store-mega-menu__grid">
                    {SHOP_CATEGORIES.map((category) => (
                      <Link
                        key={category.to}
                        to={category.to}
                        className="store-mega-menu__card"
                        onClick={closeMenus}
                      >
                        <img src={category.image} alt={category.label} loading="lazy" />
                        <div className="store-mega-menu__card-body">
                          <strong>{category.label}</strong>
                          <span>{category.description}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Container>
              </div>
            </div>

            {STORE_NAV_AFTER_PRODUCTS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'store-header__nav-link',
                    item.highlight ? 'store-header__nav-link--sale' : '',
                    isActive ? 'is-active' : '',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="store-header__actions">
            <button
              type="button"
              className="store-header__icon-btn"
              aria-label="Tìm kiếm"
              aria-expanded={searchOpen}
              onClick={() => {
                setSearchOpen((prev) => !prev);
                setAccountOpen(false);
              }}
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

            <div
              className={`store-header__account-wrap ${!authState.isAuthenticated ? 'store-header__account-wrap--guest' : ''
                }`}
            >
              <button
                type="button"
                className="store-header__icon-btn store-header__icon-btn--account"
                aria-label={authState.isAuthenticated ? 'Tài khoản' : 'Đăng nhập / Đăng ký'}
                aria-expanded={accountOpen}
                onClick={() => {
                  setAccountOpen((prev) => !prev);
                  setSearchOpen(false);
                }}
              >
                <Person size={20} />
                {authState.isAuthenticated && (
                  <span className="store-header__account-label d-none d-lg-inline">
                    Tài khoản
                  </span>
                )}
              </button>

              {authState.isAuthenticated && accountOpen && (
                <>
                  <button
                    type="button"
                    className="store-header__backdrop d-none d-md-block"
                    aria-label="Đóng menu tài khoản"
                    onClick={() => setAccountOpen(false)}
                  />
                  <div className="store-header__account-dropdown d-none d-md-block">
                    {renderAccountPanel()}
                  </div>
                </>
              )}

              {!authState.isAuthenticated && accountOpen && (
                <>
                  <button
                    type="button"
                    className="store-header__backdrop d-none d-md-block"
                    aria-label="Đóng menu tài khoản"
                    onClick={() => setAccountOpen(false)}
                  />
                  <div className="store-header__account-dropdown store-header__account-dropdown--guest d-none d-md-block is-open">
                    {renderGuestPanel()}
                  </div>
                </>
              )}
            </div>

            <Link to="/cart" className="store-header__cart" aria-label="Giỏ hàng" onClick={handleCartClick}>
              <Bag size={20} />
              <span className="store-header__cart-label d-none d-lg-inline">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="store-header__cart-count">{cartCount}</span>
              )}
            </Link>
          </div>
        </Container>
      </div>

      {searchOpen && (
        <div className="store-header__search-panel">
          <Container>
            <Form onSubmit={handleSearchSubmit} className="store-header__search-form">
              <Search size={18} className="store-header__search-icon" />
              <Form.Control
                type="search"
                autoFocus
                placeholder="Tìm áo, quần, phụ kiện..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="store-header__search-input"
                aria-label="Tìm kiếm sản phẩm"
              />
              <button type="submit" className="store-header__search-submit">
                Tìm
              </button>
            </Form>
          </Container>
        </div>
      )}

      <Offcanvas show={mobileMenuOpen} onHide={() => setMobileMenuOpen(false)} placement="start">
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="store-header__logo fs-5 mb-0">{SITE_NAME}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <nav className="store-mobile-nav__section">
            {STORE_NAV_BEFORE_PRODUCTS.map((item) => (
              <Link key={item.to} to={item.to} className="store-mobile-nav__link" onClick={closeMenus}>
                {item.label}
              </Link>
            ))}
          </nav>

          <Accordion flush className="store-mobile-nav">
            <Accordion.Item eventKey="shop">
              <Accordion.Header>Sản phẩm</Accordion.Header>
              <Accordion.Body className="pt-0">
                {SHOP_CATEGORIES.map((category) => (
                  <Link
                    key={category.to}
                    to={category.to}
                    className="store-mobile-nav__link"
                    onClick={closeMenus}
                  >
                    {category.label}
                  </Link>
                ))}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <nav className="store-mobile-nav__section">
            {STORE_NAV_AFTER_PRODUCTS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`store-mobile-nav__link ${item.highlight ? 'store-mobile-nav__link--sale' : ''}`}
                onClick={closeMenus}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/cart" className="store-mobile-nav__link" onClick={handleCartClick}>
              Giỏ hàng {cartCount > 0 ? `(${cartCount})` : ''}
            </Link>
          </nav>

          <div className="store-mobile-nav__account border-top">
            {authState.isAuthenticated ? renderAccountPanel() : renderGuestPanel()}
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
};

export default Header;