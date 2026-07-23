// src/features/reviews/pages/AdminReviews.jsx
// Phase 7b — thêm filter (product/rating/trạng thái/từ khoá) + nút ẩn/khôi phục (có confirm)
// lên trên bảng đọc-only của Phase 7a. Cùng cách làm với OrderManagement.jsx (debounce ô tìm
// theo từ khoá, đổi trạng thái xong tải lại bảng, huỷ request cũ khi bộ lọc đổi liên tiếp).
import { useCallback, useEffect, useRef, useState } from 'react';
import { Table, Badge, Alert, Spinner, Container, Row, Col, Form, Button } from 'react-bootstrap';
import Pagination from 'react-bootstrap/Pagination';

import { searchReviews, updateVisibility } from '../services/adminReviewApi.js';
import { formatDateTime } from '../../../shared/utils/format';
import { readApiError } from '../../../shared/utils/apiError.js';

const RATINGS = [1, 2, 3, 4, 5];

// Chờ 400ms sau khi ngừng gõ mới gọi API — cùng hằng số với OrderManagement.jsx/ProductList.jsx.
const SEARCH_DEBOUNCE_MS = 400;

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null); // id review đang chờ server trả lời PATCH

  // Bộ lọc: cả 4 đều đẩy xuống server (BE đã hỗ trợ sẵn từ Phase 3), không lọc tại chỗ.
  const [productIdFilter, setProductIdFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState('ALL');
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  // Đổi trang liên tiếp -> nhiều request cùng bay; chỉ nhận kết quả của lần gọi mới nhất
  // (cùng cách làm với AuditLogs.jsx / OrderManagement.jsx).
  const latestRequestRef = useRef(0);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => setDebouncedKeyword(keyword), SEARCH_DEBOUNCE_MS);
    return () => globalThis.clearTimeout(timer);
  }, [keyword]);

  // Đổi bộ lọc thì quay về trang đầu — tránh trường hợp đang ở trang 3 rồi lọc còn 1 trang dữ liệu.
  useEffect(() => {
    setPage(0);
  }, [productIdFilter, ratingFilter, visibilityFilter, debouncedKeyword]);

  const loadReviews = useCallback(async () => {
    const requestId = ++latestRequestRef.current;
    try {
      setLoading(true);
      const data = await searchReviews({
        productId: productIdFilter ? Number(productIdFilter) : undefined,
        rating: ratingFilter === 'ALL' ? undefined : Number(ratingFilter),
        isVisible: visibilityFilter === 'ALL' ? undefined : visibilityFilter === 'VISIBLE',
        keyword: debouncedKeyword || undefined,
        page,
      });
      if (requestId !== latestRequestRef.current) return;
      setReviews(data.content ?? []);
      setTotalPages(data.totalPages ?? 0);
      setError('');
    } catch (err) {
      if (requestId !== latestRequestRef.current) return;
      setError(readApiError(err, 'Không tải được danh sách đánh giá.'));
    } finally {
      if (requestId === latestRequestRef.current) setLoading(false);
    }
  }, [productIdFilter, ratingFilter, visibilityFilter, debouncedKeyword, page]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Ẩn/khôi phục: gọi server trước, server đồng ý mới tải lại bảng — cùng cách làm với
  // handleChangeStatus của OrderManagement.jsx (không sửa 1 dòng tại chỗ, vì review có thể văng
  // ra khỏi bộ lọc "Đang lọc: Đã ẩn"/"Đang hiện" sau khi đổi trạng thái).
  async function handleToggleVisibility(review) {
    const nextVisible = !review.isVisible;
    const ok = globalThis.confirm(
      nextVisible ? `Khôi phục (hiện lại) đánh giá #${review.id}?` : `Ẩn đánh giá #${review.id}?`,
    );
    if (!ok) return;
    try {
      setSavingId(review.id);
      await updateVisibility(review.id, nextVisible);
      setError('');
      await loadReviews();
    } catch (err) {
      setError(readApiError(err, 'Đổi trạng thái ẩn/hiện thất bại.'));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Quản lý đánh giá</h1>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Thanh lọc */}
      <Row className="g-2 mb-3">
        <Col xs={12} md={2}>
          <Form.Control
            type="number"
            placeholder="ID sản phẩm"
            value={productIdFilter}
            onChange={(e) => setProductIdFilter(e.target.value)}
          />
        </Col>
        <Col xs={12} md={2}>
          <Form.Select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
            <option value="ALL">Tất cả sao</option>
            {RATINGS.map((r) => (
              <option key={r} value={r}>{r} sao</option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} md={2}>
          <Form.Select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)}>
            <option value="ALL">Tất cả trạng thái</option>
            <option value="VISIBLE">Đang hiện</option>
            <option value="HIDDEN">Đã ẩn</option>
          </Form.Select>
        </Col>
        <Col xs={12} md={6}>
          <Form.Control
            placeholder="Tìm theo nội dung hoặc tên người đánh giá..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Sản phẩm</th>
            <th>Người đánh giá</th>
            <th>Sao</th>
            <th>Nội dung</th>
            <th>Thời gian</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.productName}</td>
              <td>{r.authorName}</td>
              <td>{r.rating} ★</td>
              <td className="small">{r.comment}</td>
              <td>{formatDateTime(r.createdAt)}</td>
              <td>
                {r.isVisible ? (
                  <Badge bg="success">Hiện</Badge>
                ) : (
                  <Badge bg="secondary">Đã ẩn</Badge>
                )}
              </td>
              <td>
                <Button
                  size="sm"
                  variant={r.isVisible ? 'outline-danger' : 'outline-success'}
                  disabled={savingId === r.id}
                  onClick={() => handleToggleVisibility(r)}
                >
                  {savingId === r.id ? <Spinner animation="border" size="sm" /> : (r.isVisible ? 'Ẩn' : 'Khôi phục')}
                </Button>
              </td>
            </tr>
          ))}
          {loading && (
            <tr>
              <td colSpan={8} className="text-center py-4">
                <Spinner animation="border" size="sm" /> Đang tải...
              </td>
            </tr>
          )}
          {!loading && reviews.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center text-muted py-4">Không có đánh giá nào khớp bộ lọc.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="justify-content-center mt-3">
          <Pagination.Prev disabled={page === 0} onClick={() => setPage((p) => p - 1)} />
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item key={index} active={page === index} onClick={() => setPage(index)}>
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next disabled={page === totalPages - 1} onClick={() => setPage((p) => p + 1)} />
        </Pagination>
      )}
    </Container>
  );
}

export default AdminReviews;
