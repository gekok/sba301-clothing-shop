import { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import AddressFormModal from './AddressFormModal.jsx';

function AddressSelection({ addresses, selectedAddressId, selectedAddress, onChange, onAddAddress }) {
  const [showModal, setShowModal] = useState(false);

  const handleSaveAddress = (newAddress) => {
    if (onAddAddress) {
      onAddAddress(newAddress);
    }
  };

  return (
    <div className="cartx-sidebar-block">
      <Row className="align-items-center mb-3">
        <Col>
          <h2 className="cartx-section-title mb-0">Địa chỉ giao hàng</h2>
        </Col>
        <Col xs="auto">
          <Button variant="outline-dark" size="sm" onClick={() => setShowModal(true)}>
            + Thêm địa chỉ mới
          </Button>
        </Col>
      </Row>
      
      <Form.Select
        value={selectedAddressId ?? ''}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mb-3"
      >
        {addresses.map((address) => (
          <option key={address.id} value={address.id}>
            {address.recipientName} - {address.district} {address.isDefault ? '(Mặc định)' : ''}
          </option>
        ))}
      </Form.Select>

      {selectedAddress ? (
        <div className="cartx-address mt-2">
          <p className="mb-1 fw-bold">{selectedAddress.recipientName} / {selectedAddress.phone}</p>
          <p className="mb-0 text-muted">
            {selectedAddress.street}, {selectedAddress.ward && `${selectedAddress.ward}, `}
            <br/>
            {selectedAddress.district}, {selectedAddress.province}
          </p>
        </div>
      ) : null}

      <AddressFormModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        onSave={handleSaveAddress} 
      />
    </div>
  );
}

export default AddressSelection;
