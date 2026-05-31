import React from 'react';
import styles from './Cart.module.css';
import { Row, Col, Image, Button, FormControl } from 'react-bootstrap';

export default function CartItem({ item, onChangeQty, onRequestRemove, index = 0 }) {
    const increment = () => onChangeQty(item.id, item.quantity + 1);
    const decrement = () => onChangeQty(item.id, Math.max(1, item.quantity - 1));
    const truncatedSku = item.sku ? (item.sku.length > 14 ? item.sku.slice(0,14) + '…' : item.sku) : null;

    return (
        <div className={`${styles['cart-item']} ${styles['reveal']}`} style={{ ['--delay']: `${index * 80}ms` }}>
            <Row className="w-100 align-items-center">
                <Col xs={3} className={styles['ci-thumb']}>
                    <Image src={item.image || '/placeholder-variant.png'} alt={item.productName} rounded fluid />
                </Col>
                <Col xs={6} className={styles['ci-body']}>
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <div className={styles['ci-title']}>{item.productName}</div>
                            <div className={`${styles['ci-variant']} ${styles['variantInfo']}`} title={item.variantInfo}>{item.variantInfo}</div>
                            <div className="mt-2 d-flex align-items-center gap-2">
                                {item.discount > 0 && <span className={`${styles['discount-badge']}`}>-{Math.round((item.discount / item.unitPrice) * 100)}%</span>}
                                {item.sku && <span className={`${styles['product-badge']} me-2 ${styles['skuText']}`} title={item.sku}>SKU: {truncatedSku}</span>}
                                {item.vendor && <span className="text-muted small">{item.vendor}</span>}
                            </div>
                        </div>
                        <div className={styles['ci-price']}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice)}</div>
                    </div>
                    <div className={`${styles['ci-meta']} d-flex align-items-center justify-content-between mt-2`}>
                        <div className={styles['ci-controls']}>
                            <Button variant="outline-secondary" onClick={decrement} disabled={item.quantity <= 1}>−</Button>
                            <FormControl className={styles['qtyInput'] + ' text-center'} readOnly value={item.quantity} />
                            <Button
                                variant="outline-secondary"
                                onClick={increment}
                                disabled={typeof item.stockQuantity === 'number' ? item.quantity >= item.stockQuantity : false}
                            >+
                            </Button>
                        </div>
                        {typeof item.stockQuantity === 'number' && (
                            <div className={`${styles['stockInfo']} ms-3 text-muted small`} title={`Tồn: ${item.stockQuantity}${item.stockQuantity <=5 ? ' • Còn ít hàng':''}`}>
                                Tồn: {item.stockQuantity}
                                {item.stockQuantity <= 5 && <span className="text-danger small ms-2">• Còn ít hàng</span>}
                            </div>
                        )}
                        <div className={`${styles['estimatedDelivery']} ms-3 text-muted small`}>Dự kiến giao hàng: {item.estimatedDeliveryDays} ngày</div>
                    </div>
                </Col>
                <Col xs={3} className={`${styles['ci-actions']} text-end`}> 
                    <div className={styles['ci-sub']} aria-label={`Tổng của ${item.productName}`}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}</div>
                    <Button size="sm" variant="outline-danger" className={`${styles['ci-remove-btn']} text-decoration-none`} onClick={() => onRequestRemove(item.id)} aria-label={`Xóa ${item.productName}`} title={`Xóa ${item.productName}`}>Xóa</Button>
                </Col>
            </Row>
        </div>
    );
}
