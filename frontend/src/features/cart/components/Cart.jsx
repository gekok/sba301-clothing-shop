import React, { useEffect, useState } from 'react';
import cartService from '../services/cart.service';
import CartItem from './CartItem';
import styles from './Cart.module.css';
import { Container, Row, Col, Card, ListGroup, Button, Spinner, Toast, ToastContainer, Modal } from 'react-bootstrap';
import Pagination from 'react-bootstrap/Pagination';

// Cart component — tries to fetch real cart, falls back to mock if API not available
export default function Cart() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shipping, setShipping] = useState(30000);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 4; // max items per page
    const [toasts, setToasts] = useState([]);

    const pushToast = (message, autohide = true, delay = 3500) => {
        const id = Date.now() + Math.random();
        setToasts(t => [...t, { id, message, autohide, delay }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), delay + 500);
    };
    const originalStateRef = React.useRef({});
    const requestSeqRef = React.useRef({});
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });

    useEffect(() => {
        let mounted = true;
        const fetchCart = async () => {
            try {
                const res = await cartService.getMyCart(); // backend may expose something like this
                if (!mounted) return;
                const data = res.data;
                setItems((data.items || []).map(i => ({
                    id: i.id,
                    productName: i.productName || i.product?.name || 'Sản phẩm',
                    variantInfo: i.variantInfo || `${i.size || ''} / ${i.color || ''}`,
                    sku: i.sku || i.productVariant?.sku || i.product?.sku || null,
                    unitPrice: i.unitPrice || i.price || 0,
                    quantity: i.quantity || 1,
                    discount: i.discount || 0,
                    subtotal: (i.unitPrice || i.price || 0) * (i.quantity || 1) - ((i.discount || 0) * (i.quantity || 1)),
                    image: i.imageUrl || i.product?.thumbnailUrl || null,
                    variantId: i.variantId || i.productVariantId,
                    stockQuantity: i.stockQuantity ?? i.stock ?? i.productVariant?.stockQuantity ?? null,
                    estimatedDeliveryDays: i.estimatedDeliveryDays || 3,
                    vendor: i.vendor || i.product?.brand || null,
                })));
            } catch (err) {
                // fallback mock — useful for local dev when backend isn't ready
                const mock = [
                    { id: 1, productName: 'Áo thun cotton basic', variantInfo: 'Size M / Trắng', sku: 'AO-COT-M-WHT', unitPrice: 199000, quantity: 2, discount: 0, subtotal: 398000, image: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lxutzda9r8491e', stockQuantity: 50, estimatedDeliveryDays: 3, vendor: 'Local' },
                    { id: 2, productName: 'Váy hoa mùa hè', variantInfo: 'Size S / Đỏ', sku: 'VAY-HOA-S-RED', unitPrice: 349000, quantity: 1, discount: 0, subtotal: 349000, image: 'https://images2.thanhnien.vn/Uploaded/dungpt/2022_05_10/vay-hoa-dreamers-9-3412.jpg', stockQuantity: 15, estimatedDeliveryDays: 4, vendor: 'Local' },
                    { id: 3, productName: 'Quần jeans rách gối', variantInfo: 'Size L / Xanh', sku: 'JEAN-RACH-L-BLU', unitPrice: 499000, quantity: 1, discount: 50000, subtotal: 449000, image: 'https://tse3.mm.bing.net/th/id/OIP.vpZUMifUbqrhZo--1TGa1gHaJ4?rs=1&pid=ImgDetMain&o=7&rm=3', stockQuantity: 8, estimatedDeliveryDays: 5, vendor: 'Denim Co.' },
                    { id: 4, productName: 'Áo khoác dù nhẹ', variantInfo: 'Size M / Xám', sku: 'JKT-WIND-M-GRY', unitPrice: 799000, quantity: 1, discount: 0, subtotal: 799000, image: 'https://down-vn.img.susercontent.com/file/72d2780463ab2390692e64060ca5c1a2', stockQuantity: 3, estimatedDeliveryDays: 6, vendor: 'OuterWear' },
                    { id: 5, productName: 'Tất cotton (gói 3)', variantInfo: 'One size', sku: 'SOCK-3PK', unitPrice: 99000, quantity: 2, discount: 0, subtotal: 198000, image: 'https://tse2.mm.bing.net/th/id/OIP.59fApAga8yVH-0nad5gHsgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3', stockQuantity: 120, estimatedDeliveryDays: 2, vendor: 'Basics' },
                ];
                if (mounted) setItems(mock);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchCart();
        return () => { mounted = false; };
    }, []);

    const recalc = (next) => {
        setItems(next.map(i => ({ ...i, subtotal: (i.unitPrice * i.quantity) - ((i.discount || 0) * i.quantity) })));
    };

    const handleChangeQty = async (id, qty) => {
        const target = items.find(i => i.id === id);
        if (!target) return;
        // If stockQuantity is known, enforce it
        if (typeof target.stockQuantity === 'number' && qty > target.stockQuantity) {
            pushToast('Không đủ tồn kho.');
            return;
        }
        // Save original state for this item if not already saved (first optimistic update)
        if (!originalStateRef.current[id]) {
            const found = items.find(i => i.id === id);
            originalStateRef.current[id] = found ? { ...found } : null;
        }

        // Prepare optimistic update using functional state update to avoid staleness
        const next = items.map(i => i.id === id ? { ...i, quantity: qty } : i);
        recalc(next);

        // Sequence id for this request to avoid race-rollbacks
        const seq = (requestSeqRef.current[id] || 0) + 1;
        requestSeqRef.current[id] = seq;

        try {
            await cartService.updateItem(id, qty);
            // if this is the latest request for this id, clear original saved state
            if (requestSeqRef.current[id] === seq) {
                delete originalStateRef.current[id];
            }
        } catch (err) {
            // Only rollback if this failed request is the latest one for this item
            if (requestSeqRef.current[id] === seq) {
                const original = originalStateRef.current[id];
                if (original) {
                    // restore original for this item only
                    setItems(curr => curr.map(i => i.id === id ? { ...original } : i));
                    pushToast('Cập nhật thất bại. Đã khôi phục trạng thái trước đó.');
                }
                delete originalStateRef.current[id];
            }
        }
    };

    const handleRemove = async (id) => {
        const next = items.filter(i => i.id !== id);
        recalc(next);
        try {
            await cartService.removeItem(id);
        } catch (err) {
            // ignore
        }
    };

    const openDeleteModal = (id) => {
        const it = items.find(i => i.id === id);
        setDeleteModal({ show: true, id, name: it ? it.productName : '' });
    };

    const confirmDelete = async () => {
        const id = deleteModal.id;
        setDeleteModal({ show: false, id: null, name: '' });
        await handleRemove(id);
    };

    const subtotal = items.reduce((s, i) => s + ((i.unitPrice * i.quantity) - ((i.discount || 0) * i.quantity)), 0);
    const total = subtotal + (items.length ? shipping : 0);

    // Pagination helpers
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const visibleItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const goPage = (p) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

    if (loading) return (
        <div className={styles['cart-shell']}>
            <Spinner animation="border" /> <span className="ms-2">Đang tải giỏ hàng…</span>
        </div>
    );

    return (
        <div className={styles['cart-shell']}>
            <ToastContainer position="top-end" className="p-3">
                {toasts.map(t => (
                    <Toast key={t.id} bg="light">
                        <Toast.Body>{t.message}</Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
            <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show:false, id:null, name:'' })} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc muốn xóa "{deleteModal.name}" khỏi giỏ hàng không?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setDeleteModal({ show:false, id:null, name:'' })}>Hủy</Button>
                    <Button variant="danger" onClick={confirmDelete}>Xóa</Button>
                </Modal.Footer>
            </Modal>
            <Container>
                <Row className="justify-content-center">
                    <Col lg={10}>
                        <Card className={styles['cart-panel']}>
                            <Card.Body>
                                <div className={`${styles['cart-head']} d-flex align-items-baseline justify-content-between`}>
                                    <div>
                                        <h3 className={styles['cart-title']}>Giỏ hàng</h3>
                                        <div className={styles['cart-sub']}>{items.length} sản phẩm</div>
                                        <div className={styles['accent-band']} />
                                    </div>
                                    <div className="text-end text-muted small">Miễn phí đổi trả trong 7 ngày • Hỗ trợ 24/7</div>
                                </div>

                                <Row className="mt-3">
                                    <Col md={8}>
                                        <ListGroup variant="flush" className={styles['cart-list']}>
                                            {items.length === 0 && <div className={styles['cart-empty']}>Giỏ hàng trống</div>}
                                                {visibleItems.map((item, idx) => (
                                                    <ListGroup.Item key={item.id} className="p-0 border-0">
                                                        <CartItem index={(currentPage - 1) * pageSize + idx} item={item} onChangeQty={handleChangeQty} onRequestRemove={openDeleteModal} />
                                                    </ListGroup.Item>
                                                ))}
                                        </ListGroup>

                                        {items.length > pageSize && (
                                            <div className={styles['pagination-wrap'] + ' mt-3'}>
                                                <div className="d-flex justify-content-center">
                                                    <Pagination>
                                                        <Pagination.Prev onClick={() => goPage(currentPage - 1)} disabled={currentPage === 1} />
                                                        {Array.from({ length: totalPages }).map((_, idx) => (
                                                            <Pagination.Item key={idx + 1} active={currentPage === idx + 1} onClick={() => goPage(idx + 1)}>
                                                                {idx + 1}
                                                            </Pagination.Item>
                                                        ))}
                                                        <Pagination.Next onClick={() => goPage(currentPage + 1)} disabled={currentPage === totalPages} />
                                                    </Pagination>
                                                </div>
                                            </div>
                                        )}
                                    </Col>

                                    <Col md={4}>
                                        <Card className={`${styles['cart-summary']} p-3`}>
                                            <div className={`${styles['cs-row']} d-flex justify-content-between`}>
                                                <div>Thành tiền</div>
                                                <div>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</div>
                                            </div>
                                            <div className={`${styles['cs-row']} ${styles['muted']} d-flex justify-content-between`}>
                                                <div>Phí vận chuyển</div>
                                                <div>{items.length ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shipping) : '—'}</div>
                                            </div>
                                            <div className={`${styles['cs-row']} ${styles['total']} d-flex justify-content-between mt-2`}>
                                                <div>Tổng cộng</div>
                                                <div>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</div>
                                            </div>
                                            <div className={`${styles['cs-actions']} d-flex flex-column mt-3`}>
                                                <Button className={`btn-primary ${styles['custom-checkout']} mb-2`} aria-label="Checkout">Tiến hành thanh toán</Button>
                                                <Button className={styles['custom-ghost']} variant="outline-secondary">Tiếp tục mua sắm</Button>
                                            </div>
                                        </Card>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
