import {useCallback, useEffect, useRef, useState} from 'react';
import {Table, Badge, Alert, Spinner, Container, Row, Col, Form, Button, ListGroup} from 'react-bootstrap';
import Pagination from 'react-bootstrap/Pagination';

import {searchReviews, updateVisibility} from '../services/adminReviewApi.js';
import {getProducts} from '../../products/service/productService.js';
import {formatDateTime} from '../../../shared/utils/format';
import {readApiError} from '../../../shared/utils/apiError.js';
import {buildPageRange, ELLIPSIS} from '../../../shared/utils/pagination.js';

const RATINGS = [1, 2, 3, 4, 5];

const SEARCH_DEBOUNCE_MS = 400;

function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [savingId, setSavingId] = useState(null);

    const [productIdFilter, setProductIdFilter] = useState('');
    const [productNameQuery, setProductNameQuery] = useState('');
    const [debouncedProductNameQuery, setDebouncedProductNameQuery] = useState('');
    const [productOptions, setProductOptions] = useState([]);
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [searchingProducts, setSearchingProducts] = useState(false);
    const [ratingFilter, setRatingFilter] = useState('ALL');
    const [visibilityFilter, setVisibilityFilter] = useState('ALL');
    const [keyword, setKeyword] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');

    const latestRequestRef = useRef(0);
    const latestProductSearchRef = useRef(0);

    useEffect(() => {
        const timer = globalThis.setTimeout(() => setDebouncedKeyword(keyword), SEARCH_DEBOUNCE_MS);
        return () => globalThis.clearTimeout(timer);
    }, [keyword]);

    useEffect(() => {
        const timer = globalThis.setTimeout(() => setDebouncedProductNameQuery(productNameQuery), SEARCH_DEBOUNCE_MS);
        return () => globalThis.clearTimeout(timer);
    }, [productNameQuery]);

    useEffect(() => {
        const trimmed = debouncedProductNameQuery.trim();
        if (!trimmed) {
            setProductOptions([]);
            return;
        }
        const searchId = ++latestProductSearchRef.current;
        setSearchingProducts(true);
        getProducts(0, 5, trimmed)
            .then((res) => {
                if (searchId !== latestProductSearchRef.current) return;
                setProductOptions(res.data?.content ?? []);
            })
            .catch(() => {
                if (searchId !== latestProductSearchRef.current) return;
                setProductOptions([]);
            })
            .finally(() => {
                if (searchId === latestProductSearchRef.current) setSearchingProducts(false);
            });
    }, [debouncedProductNameQuery]);

    function handleSelectProduct(product) {
        setProductIdFilter(String(product.id));
        setProductNameQuery(product.name);
        setProductOptions([]);
        setShowProductDropdown(false);
    }

    function handleProductNameChange(value) {
        setProductNameQuery(value);
        setShowProductDropdown(true);
        if (productIdFilter) setProductIdFilter('');
    }

    function handleClearProductFilter() {
        setProductIdFilter('');
        setProductNameQuery('');
        setProductOptions([]);
        setShowProductDropdown(false);
    }

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

            <Row className="g-2 mb-3">
                <Col xs={12} md={2} className="position-relative">
                    <Form.Control
                        type="text"
                        placeholder="Tìm theo tên sản phẩm..."
                        value={productNameQuery}
                        onChange={(e) => handleProductNameChange(e.target.value)}
                        onFocus={() => setShowProductDropdown(true)}
                        onBlur={() => globalThis.setTimeout(() => setShowProductDropdown(false), 150)}
                    />
                    {productIdFilter && (
                        <Button
                            variant="link"
                            size="sm"
                            className="position-absolute top-0 end-0 text-decoration-none"
                            onClick={handleClearProductFilter}
                            title="Bỏ lọc theo sản phẩm"
                        >
                            ×
                        </Button>
                    )}
                    {showProductDropdown && productNameQuery.trim() && (
                        <ListGroup className="position-absolute w-100 shadow-sm" style={{zIndex: 1000}}>
                            {searchingProducts && (
                                <ListGroup.Item disabled>
                                    <Spinner animation="border" size="sm"/> Đang tìm...
                                </ListGroup.Item>
                            )}
                            {!searchingProducts && productOptions.length === 0 && (
                                <ListGroup.Item disabled>Không tìm thấy sản phẩm phù hợp</ListGroup.Item>
                            )}
                            {!searchingProducts && productOptions.map((p) => (
                                <ListGroup.Item
                                    key={p.id}
                                    action
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleSelectProduct(p)}
                                >
                                    {p.name}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
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
                        <td className="small">
                <span
                    className="d-inline-block text-truncate align-bottom"
                    style={{maxWidth: '260px'}}
                    title={r.comment}
                >
                  {r.comment}
                </span>
                        </td>
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
                                {savingId === r.id ?
                                    <Spinner animation="border" size="sm"/> : (r.isVisible ? 'Ẩn' : 'Khôi phục')}
                            </Button>
                        </td>
                    </tr>
                ))}
                {loading && (
                    <tr>
                        <td colSpan={8} className="text-center py-4">
                            <Spinner animation="border" size="sm"/> Đang tải...
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
                    <Pagination.Prev disabled={page === 0} onClick={() => setPage((p) => p - 1)}/>
                    {buildPageRange(page, totalPages).map((item, index) =>
                        item === ELLIPSIS ? (
                            <Pagination.Ellipsis key={`ellipsis-${index}`} disabled/>
                        ) : (
                            <Pagination.Item key={item} active={page === item} onClick={() => setPage(item)}>
                                {item + 1}
                            </Pagination.Item>
                        )
                    )}
                    <Pagination.Next disabled={page === totalPages - 1} onClick={() => setPage((p) => p + 1)}/>
                </Pagination>
            )}
        </Container>
    );
}

export default AdminReviews;
