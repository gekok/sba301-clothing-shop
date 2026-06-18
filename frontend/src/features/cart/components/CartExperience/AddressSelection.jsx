import { Form } from 'react-bootstrap';

function AddressSelection({ addresses, selectedAddressId, selectedAddress, onChange }) {
  return (
    <div className="cartx-sidebar-block">
      <h2 className="cartx-section-title">Địa chỉ giao hàng</h2>
      <Form.Select
        value={selectedAddressId ?? ''}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mb-3"
      >
        {addresses.map((address) => (
          <option key={address.id} value={address.id}>
            {address.recipientName} - {address.district}
          </option>
        ))}
      </Form.Select>

      {selectedAddress ? (
        <div className="cartx-address mt-2">
          <p className="mb-1 fw-bold">{selectedAddress.recipientName} / {selectedAddress.phone}</p>
          <p className="mb-0 text-muted">
            {selectedAddress.street}, {selectedAddress.ward},<br/>
            {selectedAddress.district}, {selectedAddress.province}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default AddressSelection;
