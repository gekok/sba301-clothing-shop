import { useState } from 'react';
import { Form, Image, Row, Col, Stack, Modal, Button } from 'react-bootstrap';
import { formatVND } from '../../../../shared/utils/format';
import { getItemSubtotal } from '../../utils/cartMath.js';
import { isPurchasable } from '../../hooks/useCartExperience.js';

function CartItemCard({ item, checked, onToggle, onChangeQuantity, onRemove }) {
  const purchasable = isPurchasable(item);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmDelete = () => {
    setShowConfirm(false);
    onRemove(item.id);
  };

  return (
    <>
      <div className={`cartx-item ${purchasable ? '' : 'cartx-item-disabled'}`}>
        <Row className="g-4 align-items-stretch">
          {/* Checkbox */}
          <Col xs="auto" className="d-flex align-items-center">
            <Form.Check
              type="checkbox"
              aria-label={`Chọn ${item.productName}`}
              checked={checked}
              disabled={!purchasable}
              onChange={() => onToggle(item.id)}
            />
          </Col>

          {/* Thumbnail */}
          <Col xs={4} sm={3} md={2}>
            <Image src={item.thumbnail} alt={item.productName} className="cartx-thumb" />
          </Col>

          {/* Info & Controls */}
          <Col className="d-flex flex-column justify-content-between py-1">
            <div className="cartx-item-header">
              <div>
                <h2 className="cartx-item-title mb-1">{item.productName}</h2>
                <p className="text-muted small mb-2">SKU: {item.sku}</p>

                <Stack direction="horizontal" gap={2} className="flex-wrap mb-2">
                  <span className="cartx-tag">Size {item.size}</span>
                  <span className="cartx-tag">Màu {item.color}</span>
                  {purchasable ? (
                    <span className="cartx-tag text-success border-success">Tồn kho: {item.stockQuantity}</span>
                  ) : item.stockQuantity <= 0 ? (
                    <span className="cartx-tag text-danger border-danger">Hết hàng</span>
                  ) : (
                    <span className="cartx-tag text-danger border-danger">Ngừng bán</span>
                  )}
                </Stack>
              </div>

              <button
                onClick={() => setShowConfirm(true)}
                className="cartx-remove-btn"
                aria-label={`Xoá ${item.productName}`}
              >
                Xoá
              </button>
            </div>

            <div className="cartx-inline-row mt-auto">
              <div className="text-muted">
                {formatVND(item.unitPrice)}
              </div>

              <div className="cartx-price-cluster">
                <div className="cartx-qty-wrap">
                  <button
                    className="btn"
                    disabled={!purchasable || item.quantity <= 1}
                    onClick={() => onChangeQuantity(item.id, item.quantity - 1)}
                    aria-label="Giảm"
                  >
                    −
                  </button>
                  <Form.Control
                    type="number"
                    value={item.quantity}
                    min={1}
                    max={item.stockQuantity}
                    disabled={!purchasable}
                    onChange={(event) => onChangeQuantity(item.id, Number(event.target.value || 1))}
                  />
                  <button
                    className="btn"
                    disabled={!purchasable || item.quantity >= item.stockQuantity}
                    onClick={() => onChangeQuantity(item.id, item.quantity + 1)}
                    aria-label="Tăng"
                  >
                    +
                  </button>
                </div>

                <div className="cartx-subtotal-inline">
                  {formatVND(getItemSubtotal(item))}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Modal
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        centered
        className="cartx-modal"
        backdropClassName="cartx-modal-backdrop"
      >
        <Modal.Header closeButton className="cartx-modal-header-danger">
          <Modal.Title>
            <span className="text-danger me-2">■</span> XÁC NHẬN XÓA
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0 text-center py-3">Bạn có chắc chắn muốn xóa <strong>{item.productName}</strong> khỏi giỏ hàng không?</p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Row className="w-100 g-2">
            <Col>
              <Button
                variant="outline-dark"
                className="w-100 rounded-0 text-uppercase fw-bold border-2"
                onClick={() => setShowConfirm(false)}
              >
                Hủy
              </Button>
            </Col>
            <Col>
              <Button
                variant="dark"
                className="w-100 rounded-0 text-uppercase fw-bold"
                onClick={handleConfirmDelete}
              >
                Xóa
              </Button>
            </Col>
          </Row>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CartItemCard;
