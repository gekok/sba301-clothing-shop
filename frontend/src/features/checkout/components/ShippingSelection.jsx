import { Form, Stack } from 'react-bootstrap';
import { formatVND } from '../../../shared/utils/format.js';

function ShippingSelection({ shippingMethods, selectedShippingId, onChange }) {
  return (
    <div className="checkoutx-sidebar-block">
      <h2 className="checkoutx-section-title">Vận chuyển</h2>
      <Stack gap={3}>
        {shippingMethods.map((method) => (
          <Form.Check
            key={method.id}
            id={`shipping-${method.id}`}
            type="radio"
            name="shippingMethod"
            checked={selectedShippingId === method.id}
            onChange={() => onChange(method.id)}
            label={
              <span className="d-flex flex-column ms-2">
                <strong className="text-uppercase" style={{ letterSpacing: '0.05em' }}>{method.name}</strong>
                <span className="text-muted mt-1">
                  {method.eta} &mdash; {formatVND(method.fee)}
                </span>
              </span>
            }
          />
        ))}
      </Stack>
    </div>
  );
}

export default ShippingSelection;
