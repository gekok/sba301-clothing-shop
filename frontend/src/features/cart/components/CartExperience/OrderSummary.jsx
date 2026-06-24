import { Alert, Button, Stack } from 'react-bootstrap';
import { formatVND } from '../../../../shared/utils/format';

function OrderSummary({
  selectedCount,
  totals,
  canCheckout,
  checkingOut,
  checkoutNotice,
  onCheckout,
}) {
  return (
    <div className="cartx-summary">
      <h2 className="cartx-section-title">Tổng cộng</h2>

      <Stack gap={3}>
        <div className="d-flex justify-content-between">
          <span>Tạm tính ({selectedCount})</span>
          <span>{formatVND(totals.itemsSubtotal)}</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>Phí giao hàng</span>
          <span>{formatVND(totals.shippingFee)}</span>
        </div>
        <div className="d-flex justify-content-between text-success">
          <span>Ưu đãi</span>
          <span>-{formatVND(totals.discountAmount)}</span>
        </div>
      </Stack>

      <div className="cartx-summary-total">
        <span className="text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '0.1em' }}>Thành tiền</span>
        <strong>{formatVND(totals.finalTotal)}</strong>
      </div>

      <Button
        variant="dark"
        size="lg"
        className="w-100 mt-4"
        disabled={!canCheckout || checkingOut}
        onClick={onCheckout}
      >
        Tiến hành thanh toán
      </Button>

      {checkoutNotice ? (
        <Alert variant={checkoutNotice.includes('không thể') ? 'danger' : 'warning'} className="mt-3 mb-0 rounded-0">
          {checkoutNotice}
        </Alert>
      ) : null}
    </div>
  );
}

export default OrderSummary;
