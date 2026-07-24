import {useEffect, useState, useMemo} from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import {Container, Row, Col, Button, Badge, Spinner, Alert, Toast, ToastContainer} from 'react-bootstrap';
import {ArrowLeft, Bag, Lightning, CheckLg, BoxSeam} from 'react-bootstrap-icons';
import {getProductById} from '../service/productService.js';
import {addItemAPI} from '../../cart/services/cartService.js';
import {formatVND} from '../../../shared/utils/format.js';
import {useProductReviewsApi} from '../../reviews/hooks/useReviews.js';
import ReviewSummary from '../../reviews/components/ReviewSummary.jsx';
import ReviewList from '../../reviews/components/ReviewList.jsx';
import ReviewFormModal from '../../reviews/components/ReviewFormModal.jsx';

function getCurrentUserIdFromToken() {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) return null;
        const payload = token.split('.')[1];
        if (!payload) return null;
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = JSON.parse(decodeURIComponent(escape(atob(base64))));
        return json.user_id != null ? Number(json.user_id) : null;
    } catch {
        return null;
    }
}

export default function CustomerProductDetail() {
    const {id} = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);

    const [addingToCart, setAddingToCart] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    const {
        summary: reviewSummary,
        reviews,
        loading: reviewsLoading,
        error: reviewsError,
        page: reviewsPage,
        totalPages: reviewsTotalPages,
        goToPage: goToReviewsPage,
        refetch: refetchReviews,
    } = useProductReviewsApi(id);

    const currentUserId = useMemo(() => getCurrentUserIdFromToken(), []);

    const [editingReview, setEditingReview] = useState(null);
    const [showEditReviewModal, setShowEditReviewModal] = useState(false);

    const handleEditReview = (review) => {
        setEditingReview({
            id: review.id,
            productId: id,
            productName: product?.name,
            rating: review.rating,
            comment: review.comment,
        });
        setShowEditReviewModal(true);
    };

    const handleReviewUpdated = () => {
        refetchReviews();
    };

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await getProductById(id);
            const data = res.data;
            setProduct(data);

            if (data?.variants?.length > 0) {
                setSelectedColor(formatColor(data.variants[0].color) || '');
                setSelectedSize(data.variants[0].size || '');
            }
        } catch (err) {
            console.error('Lỗi khi tải chi tiết sản phẩm:', err);
            setError('Không tìm thấy sản phẩm hoặc sản phẩm đã bị ngừng kinh doanh.');
        } finally {
            setLoading(false);
        }
    };

    const formatColor = (color) => {
        if (!color) return '';
        return color.replace(/Tr\?ng/gi, 'Trắng');
    };

    const availableColors = useMemo(() => {
        if (!product?.variants) return [];
        return Array.from(new Set(product.variants.map(v => formatColor(v.color)))).filter(Boolean);
    }, [product]);

    const availableSizes = useMemo(() => {
        if (!product?.variants || !selectedColor) return [];
        return product.variants
            .filter(v => formatColor(v.color) === selectedColor)
            .map(v => v.size)
            .filter(Boolean);
    }, [product, selectedColor]);

    const selectedVariant = useMemo(() => {
        if (!product?.variants) return null;
        return product.variants.find(
            v => formatColor(v.color) === selectedColor && v.size === selectedSize
        );
    }, [product, selectedColor, selectedSize]);

    useEffect(() => {
        if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
            setSelectedSize(availableSizes[0]);
        }
    }, [selectedColor, availableSizes]);

    const handleAddToCart = async (redirectCheckout = false) => {
        if (!selectedVariant) {
            alert('Vui lòng chọn đầy đủ Màu sắc và Kích cỡ.');
            return;
        }

        if (selectedVariant.stockQuantity < quantity) {
            alert(`Sản phẩm này chỉ còn ${selectedVariant.stockQuantity} món trong kho.`);
            return;
        }

        try {
            setAddingToCart(true);
            await addItemAPI({
                variantId: selectedVariant.id,
                quantity: quantity
            });

            // Notify window so Header or other components can update cart count if listening
            window.dispatchEvent(new Event('cartUpdated'));

            if (redirectCheckout) {
                navigate('/cart');
            } else {
                setToastMessage(`Đã thêm ${quantity} x ${product.name} (${selectedColor} / ${selectedSize}) vào giỏ hàng!`);
                setShowToast(true);
            }
        } catch (err) {
            console.error('Lỗi khi thêm vào giỏ hàng:', err);
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng.');
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <Container className="d-flex flex-column align-items-center justify-content-center py-5 my-5"
                       style={{minHeight: '60vh'}}>
                <Spinner animation="border" variant="dark" size="lg" className="mb-3"/>
                <p className="text-muted fw-bold text-uppercase" style={{letterSpacing: '0.1em'}}>Đang tải sản
                    phẩm...</p>
            </Container>
        );
    }

    if (error || !product) {
        return (
            <Container className="py-5 my-5" style={{maxWidth: '600px'}}>
                <Alert variant="danger" className="rounded-0 border-2 shadow-sm text-center py-4">
                    <h4 className="fw-bold text-uppercase mb-2">Thông báo</h4>
                    <p className="mb-4">{error || 'Sản phẩm không tồn tại.'}</p>
                    <Button onClick={() => navigate('/products')} variant="dark"
                            className="rounded-0 text-uppercase fw-bold px-4 py-2">
                        Xem sản phẩm khác
                    </Button>
                </Alert>
            </Container>
        );
    }

    const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || 'https://via.placeholder.com/500';

    return (
        <div className="bg-light py-5">
            <Container>
                <Button
                    onClick={() => navigate(-1)}
                    variant="outline-dark"
                    className="rounded-0 mb-4 fw-bold text-uppercase d-inline-flex align-items-center gap-2 border-2"
                    style={{fontSize: '0.85rem'}}
                >
                    <ArrowLeft/> Quay lại
                </Button>

                <Row className="g-5">
                    {/* Product Gallery */}
                    <Col lg={6}>
                        <div className="checkoutx-panel p-3 border border-dark border-3 bg-white mb-3"
                             style={{boxShadow: '8px 8px 0px #000'}}>
                            <img
                                src={primaryImage}
                                alt={product.name}
                                className="w-100 object-fit-cover"
                                style={{height: '480px'}}
                            />
                        </div>
                        {product.images?.length > 1 && (
                            <div className="d-flex gap-2 overflow-auto pb-2">
                                {product.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img.url}
                                        alt={`${product.name} ${idx}`}
                                        className="border border-dark border-2 p-1 bg-white cursor-pointer object-fit-cover"
                                        style={{width: '80px', height: '80px'}}
                                    />
                                ))}
                            </div>
                        )}
                    </Col>

                    <Col lg={6}>
                        <div className="checkoutx-panel p-4 p-md-5 border border-dark border-3 bg-white"
                             style={{boxShadow: '8px 8px 0px #000'}}>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <Badge bg="dark" className="rounded-0 text-uppercase px-3 py-2">
                                    {product.categoryName || 'Sản phẩm'}
                                </Badge>
                                {product.brand && (
                                    <span className="text-muted fw-bold text-uppercase small">
                    Thương hiệu: {product.brand}
                  </span>
                                )}
                            </div>

                            <h1 className="fw-bold text-uppercase mb-3"
                                style={{fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.02em'}}>
                                {product.name}
                            </h1>

                            <div className="fs-2 fw-bold text-danger mb-4">
                                {formatVND(selectedVariant?.price || product.basePrice)}
                            </div>

                            <hr className="border-dark border-2 my-4"/>

                            {availableColors.length > 0 && (
                                <div className="mb-4">
                                    <label className="fw-bold text-uppercase small d-block mb-2">
                                        Màu sắc: <span className="text-danger">{selectedColor}</span>
                                    </label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {availableColors.map(color => (
                                            <Button
                                                key={color}
                                                variant={selectedColor === color ? 'dark' : 'outline-dark'}
                                                className="rounded-0 text-uppercase fw-bold px-3 py-2 border-2"
                                                onClick={() => setSelectedColor(color)}
                                            >
                                                {color}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {availableSizes.length > 0 && (
                                <div className="mb-4">
                                    <label className="fw-bold text-uppercase small d-block mb-2">
                                        Kích cỡ: <span className="text-danger">{selectedSize}</span>
                                    </label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {availableSizes.map(size => (
                                            <Button
                                                key={size}
                                                variant={selectedSize === size ? 'dark' : 'outline-dark'}
                                                className="rounded-0 text-uppercase fw-bold px-3 py-2 border-2"
                                                onClick={() => setSelectedSize(size)}
                                            >
                                                {size}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mb-4">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <label className="fw-bold text-uppercase small mb-0">Số lượng:</label>
                                    {selectedVariant && (
                                        <span
                                            className={`small fw-bold ${selectedVariant.stockQuantity > 0 ? 'text-success' : 'text-danger'}`}>
                      <BoxSeam className="me-1"/>
                                            {selectedVariant.stockQuantity > 0 ? `Còn ${selectedVariant.stockQuantity} sản phẩm trong kho` : 'Hết hàng'}
                    </span>
                                    )}
                                </div>

                                <div className="d-flex align-items-center border border-dark border-2 bg-light"
                                     style={{width: '150px'}}>
                                    <Button
                                        variant="link"
                                        className="text-dark text-decoration-none px-3 py-1 fw-bold fs-5"
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </Button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="form-control text-center border-0 bg-transparent fw-bold px-0"
                                        style={{shadow: 'none'}}
                                    />
                                    <Button
                                        variant="link"
                                        className="text-dark text-decoration-none px-3 py-1 fw-bold fs-5"
                                        onClick={() => setQuantity(q => Math.min(selectedVariant?.stockQuantity || 99, q + 1))}
                                        disabled={selectedVariant && quantity >= selectedVariant.stockQuantity}
                                    >
                                        +
                                    </Button>
                                </div>
                            </div>

                            <div className="d-flex flex-column flex-sm-row gap-3 pt-2">
                                <Button
                                    variant="outline-dark"
                                    className="w-100 rounded-0 text-uppercase fw-bold py-3 border-3 d-flex align-items-center justify-content-center gap-2"
                                    onClick={() => handleAddToCart(false)}
                                    disabled={addingToCart || (selectedVariant && selectedVariant.stockQuantity <= 0)}
                                >
                                    <Bag/> {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                                </Button>

                                <Button
                                    variant="dark"
                                    className="w-100 rounded-0 text-uppercase fw-bold py-3 d-flex align-items-center justify-content-center gap-2"
                                    onClick={() => handleAddToCart(true)}
                                    disabled={addingToCart || (selectedVariant && selectedVariant.stockQuantity <= 0)}
                                >
                                    <Lightning/> Mua ngay
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                <div className="checkoutx-panel p-4 p-md-5 border border-dark border-3 bg-white mt-5"
                     style={{boxShadow: '8px 8px 0px #000'}}>
                    <h3 className="fw-bold text-uppercase mb-4"
                        style={{fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.02em'}}>
                        Đánh giá sản phẩm
                    </h3>

                    {reviewsLoading && (
                        <div className="d-flex align-items-center gap-2 text-muted py-3">
                            <Spinner animation="border" size="sm"/>
                            <span>Đang tải đánh giá...</span>
                        </div>
                    )}

                    {!reviewsLoading && reviewsError && (
                        <Alert variant="warning" className="rounded-0 mb-0">
                            {reviewsError}
                        </Alert>
                    )}

                    {!reviewsLoading && !reviewsError && (
                        <>
                            <ReviewSummary summary={reviewSummary}/>
                            <ReviewList
                                reviews={reviews}
                                currentUserId={currentUserId}
                                page={reviewsPage}
                                totalPages={reviewsTotalPages}
                                onPageChange={goToReviewsPage}
                                onEditReview={handleEditReview}
                            />
                        </>
                    )}
                </div>
            </Container>

            <ToastContainer position="bottom-end" className="p-3" style={{zIndex: 9999}}>
                <Toast show={showToast} onClose={() => setShowToast(false)} delay={4000} autohide
                       className="border-dark border-3 rounded-0 bg-dark text-white"
                       style={{boxShadow: '5px 5px 0px #000'}}>
                    <Toast.Header className="bg-dark text-white border-bottom border-secondary rounded-0">
                        <CheckLg className="text-success me-2 fs-5"/>
                        <strong className="me-auto text-uppercase">Giỏ hàng</strong>
                    </Toast.Header>
                    <Toast.Body className="fw-medium">
                        {toastMessage}
                        <div className="mt-2 pt-2 border-top border-secondary text-end">
                            <Button as={Link} to="/cart" size="sm" variant="light"
                                    className="rounded-0 text-uppercase fw-bold px-3">
                                Xem giỏ hàng
                            </Button>
                        </div>
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <ReviewFormModal
                show={showEditReviewModal}
                onHide={() => setShowEditReviewModal(false)}
                mode="edit"
                review={editingReview}
                onSubmitted={handleReviewUpdated}
            />
        </div>
    );
}