import { useState, useMemo } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import provincesTree from '../../../../shared/data/vn_provinces_tree.json';

function AddressFormModal({ show, onHide, onSave }) {
  const [validated, setValidated] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  
  const [formData, setFormData] = useState({
    recipientName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    street: '',
    isDefault: false,
  });

  const provinceList = useMemo(() => Object.values(provincesTree), []);
  
  const districtList = useMemo(() => {
    if (!formData.province) return [];
    const selectedProv = provinceList.find(p => p.name_with_type === formData.province);
    return selectedProv ? Object.values(selectedProv['quan-huyen']) : [];
  }, [formData.province, provinceList]);

  const wardList = useMemo(() => {
    if (!formData.district) return [];
    const selectedDist = districtList.find(d => d.name_with_type === formData.district);
    return selectedDist ? Object.values(selectedDist['xa-phuong']) : [];
  }, [formData.district, districtList]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData((prev) => {
      const nextState = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      if (name === 'province') {
        nextState.district = '';
        nextState.ward = '';
      } else if (name === 'district') {
        nextState.ward = '';
      }

      return nextState;
    });
    
    if (name === 'phone') {
      setPhoneError('');
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    return phoneRegex.test(phone.trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    let isValid = form.checkValidity();

    if (!validatePhone(formData.phone)) {
      setPhoneError('Số điện thoại không hợp lệ (VD: 0987654321)');
      isValid = false;
    }

    if (!isValid) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    onSave(formData);
    // Reset form after save
    setFormData({
      recipientName: '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      street: '',
      isDefault: false,
    });
    setValidated(false);
    setPhoneError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm địa chỉ giao hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tên người nhận (*)</Form.Label>
                <Form.Control
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập tên người nhận.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Số điện thoại (*)</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  isInvalid={!!phoneError}
                />
                <Form.Control.Feedback type="invalid">
                  {phoneError || 'Vui lòng nhập số điện thoại.'}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tỉnh/Thành phố (*)</Form.Label>
                <Form.Select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn Tỉnh/Thành --</option>
                  {provinceList.map(p => (
                    <option key={p.code} value={p.name_with_type}>{p.name_with_type}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Vui lòng chọn tỉnh/thành phố.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Quận/Huyện (*)</Form.Label>
                <Form.Select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  disabled={!formData.province}
                >
                  <option value="">-- Chọn Quận/Huyện --</option>
                  {districtList.map(d => (
                    <option key={d.code} value={d.name_with_type}>{d.name_with_type}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Vui lòng chọn quận/huyện.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Phường/Xã (*)</Form.Label>
                <Form.Select
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  required
                  disabled={!formData.district}
                >
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wardList.map(w => (
                    <option key={w.code} value={w.name_with_type}>{w.name_with_type}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Vui lòng chọn phường/xã.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Số nhà, tên đường (*)</Form.Label>
                <Form.Control
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập số nhà, tên đường.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="isDefault"
              name="isDefault"
              label="Đặt làm địa chỉ mặc định"
              checked={formData.isDefault}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Hủy
          </Button>
          <Button variant="dark" type="submit">
            Lưu địa chỉ
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default AddressFormModal;
