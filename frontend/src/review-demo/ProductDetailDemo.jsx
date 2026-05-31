import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Form, Row, Col, Button, Pagination } from 'react-bootstrap';
import { StarFill, ArrowLeft } from 'react-bootstrap-icons';
import { useReviewSystemDemo } from './ReviewContextDemo';

export default function ProductDetailDemo() {
  const { productId } = useParams();
  const { reviews, products } = useReviewSystemDemo();

  const [starFilter, setStarFilter] = useState('ALL');
  const [variantFilter, setVariantFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const targetProduct = products[productId || "PROD-DEMO"];
  const productReviews = reviews.filter(r => r.productId === (productId || "PROD-DEMO"));
  const uniqueVariants = [...new Set(productReviews.map(r => r.variantInfo))];

  const filteredAndSorted = productReviews
    .filter(r => starFilter === 'ALL' || r.rating === parseInt(starFilter))
    .filter(r => variantFilter === 'ALL' || r.variantInfo === variantFilter)
    .sort((a, b) => sortOrder === 'NEWEST' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt));

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedReviews = filteredAndSorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }} className="py-2">
      <Link to="/demo" className="text-decoration-none small text-secondary d-inline-flex align-items-center gap-1 mb-4 fw-medium">
        <ArrowLeft size={14}/> Quay lại danh sách đơn hàng demo
      </Link>

      <Card className="border-0 p-4 rounded-3 shadow-sm bg-white">
        <div className="mb-4">
          <span className="text-muted small d-block mb-1">MÀN HÌNH 4 - CHI TIẾT SẢN PHẨM & FEEDBACK</span>
          <h5 className="fw-bold text-dark">{targetProduct?.name}</h5>
        </div>

        {/* DASHBOARD TỔNG QUAN */}
        <div className="p-4 rounded-3 mb-4 d-flex flex-column flex-md-row align-items-center gap-4 bg-light border border-light">
          <div className="text-center px-4 border-end border-secondary border-opacity-10">
            <h2 className="fw-bolder mb-0 text-dark" style={{ fontSize: '34px' }}>4.9</h2>
            <div className="mb-1 text-warning" style={{ fontSize: '13px' }}><StarFill/><StarFill/><StarFill/><StarFill/><StarFill/></div>
            <span className="text-muted d-block small">{productReviews.length} nhận xét</span>
          </div>
          
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {['ALL', '5', '4'].map(star => {
              const count = star === 'ALL' ? productReviews.length : productReviews.filter(r => r.rating === parseInt(star)).length;
              const isSelected = starFilter === star;
              return (
                <Button key={star} size="sm" variant={isSelected ? "dark" : "white"} className="px-3 py-2 rounded border fw-medium" 
                  style={isSelected ? { backgroundColor: '#2b3a4a', borderColor: '#2b3a4a' } : {}}
                  onClick={() => { setStarFilter(star); setCurrentPage(1); }}>
                  {star === 'ALL' ? 'Tất cả' : `${star} Sao`} <span className="ms-1 badge bg-light text-dark">({count})</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* DROP-DOWNS BỘ LỌC */}
        <Row className="g-3 mb-4 p-2.5 rounded bg-light mx-0 align-items-center">
          <Col xs={12} sm={6}>
            <Form.Group className="d-flex align-items-center gap-2">
              <span className="small text-secondary text-nowrap fw-semibold" style={{ fontSize: '12px' }}>Phân loại:</span>
              <Form.Select size="sm" value={variantFilter} onChange={e => { setVariantFilter(e.target.value); setCurrentPage(1); }}>
                <option value="ALL">Tất cả mẫu mã</option>
                {uniqueVariants.map(v => <option key={v} value={v}>{v}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Group className="d-flex align-items-center gap-2">
              <span className="small text-secondary text-nowrap fw-semibold" style={{ fontSize: '12px' }}>Sắp xếp:</span>
              <Form.Select size="sm" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="NEWEST">Đánh giá mới nhất trước</option>
                <option value="OLDEST">Đánh giá cũ nhất trước</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* FEED DANH SÁCH REVIEW THỰC TẾ */}
        {paginatedReviews.length === 0 ? (
          <div className="text-center py-4 text-muted small fw-medium">Chưa có phản hồi nào khớp bộ lọc.</div>
        ) : (
          paginatedReviews.map(rev => (
            <div key={rev.id} className="border-bottom py-3">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <span className="fw-bold text-dark" style={{ fontSize: '13.5px' }}>👤 {rev.user.fullName}</span>
                <span className="text-muted small" style={{ fontSize: '11px' }}>{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="mb-2 text-warning d-flex gap-0.5" style={{ fontSize: '11px' }}>
                {[...Array(rev.rating)].map((_, i) => <StarFill key={i} />)}
              </div>
              <div className="text-muted mb-2 small">Phân loại đã mua: <span className="text-dark fw-medium">{rev.variantInfo}</span></div>
              <p className="text-dark mb-0 small" style={{ lineHeight: '1.5' }}>{rev.comment}</p>
            </div>
          ))
        )}

        {/* PHÂN TRANG */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-end mt-4">
            <Pagination size="sm" className="mb-0">
              {[...Array(totalPages)].map((_, idx) => (
                <Pagination.Item key={idx + 1} active={idx + 1 === currentPage} onClick={() => setCurrentPage(idx + 1)}>
                  {idx + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
}