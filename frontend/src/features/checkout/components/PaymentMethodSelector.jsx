import { Form, Stack } from 'react-bootstrap';

function PaymentMethodSelector({ selectedMethod, onChange }) {
  const methods = [
    {
      id: 'COD',
      name: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán bằng tiền mặt khi giao hàng tận nơi.',
      icon: 'https://cdn-icons-png.flaticon.com/512/2805/2805368.png', // Mock icon
    },
    {
      id: 'VNPAY',
      name: 'Cổng thanh toán VNPay',
      description: 'Quét mã QR qua ứng dụng ngân hàng hoặc thẻ ATM nội địa.',
      icon: 'https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png',
    },
    {
      id: 'MOMO',
      name: 'Ví điện tử MoMo',
      description: 'Thanh toán nhanh chóng, an toàn qua ứng dụng MoMo.',
      icon: 'https://developers.momo.vn/v3/assets/images/transparent-background-logo-138ebf0ffca865ec0f1a7d9c1e4a9f3c.png',
    },
  ];

  return (
    <div className="checkoutx-panel mb-4">
      <h2 className="checkoutx-section-title">Phương thức thanh toán</h2>
      <Stack gap={3}>
        {methods.map((method) => (
          <div
            key={method.id}
            className={`payment-method-card ${selectedMethod === method.id ? 'selected' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => onChange(method.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(method.id);
              }
            }}
          >
            <Form.Check
              type="radio"
              name="paymentMethod"
              id={`payment-${method.id}`}
              checked={selectedMethod === method.id}
              onChange={() => onChange(method.id)}
            />
            <img src={method.icon} alt={method.name} className="payment-method-icon mx-2" />
            <div className="payment-method-info">
              <p className="payment-method-name">{method.name}</p>
              <p className="payment-method-desc">{method.description}</p>
            </div>
          </div>
        ))}
      </Stack>
    </div>
  );
}

export default PaymentMethodSelector;
