import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import ProductPagination from "../components/ProductPagination";
import { getCategories } from "../service/categoryService.js";
import useProducts from "../hooks/useProducts.js";
import { formatVND } from "../../../shared/utils/format.js";
import "../styles/product.css";

function PublicProductList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryCategory = searchParams.get("category");
    const querySearch = searchParams.get("q");

    const [searchInput, setSearchInput] = useState(querySearch || "");
    const [categories, setCategories] = useState([]);

    const {
        products,
        loading,
        page,
        setPage,
        totalPages,
        categoryId,
        filterByCategory,
        searchProducts,
        status,
        filterByStatus
    } = useProducts({ status: "ACTIVE" });

    // Xử lý tìm kiếm với delay (debounce)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchInput !== querySearch && searchInput !== "") {
                 searchProducts(searchInput);
                 setSearchParams(prev => {
                     prev.set("q", searchInput);
                     return prev;
                 });
            } else if (searchInput === "" && querySearch) {
                 searchProducts("");
                 setSearchParams(prev => {
                     prev.delete("q");
                     return prev;
                 });
            }
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [searchInput]);

    // Tải danh mục và xử lý tham số danh mục từ URL (ví dụ từ Mega Menu)
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await getCategories();
                setCategories(response.data);
                
                // Ánh xạ tên danh mục từ URL sang categoryId
                if (queryCategory) {
                    const matchedCat = response.data.find(c => 
                        c.name.toLowerCase().includes(queryCategory.toLowerCase()) || 
                        c.id.toString() === queryCategory
                    );
                    if (matchedCat && matchedCat.id !== categoryId) {
                        filterByCategory(matchedCat.id);
                    }
                }
            } catch (error) {
                console.error("Unable to load categories:", error);
            }
        };
        loadCategories();
    }, [queryCategory]);

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        filterByCategory(value);
        setSearchParams(prev => {
            if (value) {
                prev.set("category", value);
            } else {
                prev.delete("category");
            }
            return prev;
        });
    };

    if (loading && products.length === 0) {
        return (
            <Container className="py-5 text-center">
                <h4 className="text-muted">Đang tải sản phẩm...</h4>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="fw-bold mb-4 text-center text-uppercase" style={{ letterSpacing: '0.05em' }}>
                Tất cả sản phẩm
            </h2>
            
            <Row className="mb-4 justify-content-center">
                <Col md={6} lg={5} className="mb-3 mb-md-0">
                    <Form.Control
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="rounded-0 border-dark"
                        style={{ padding: '10px' }}
                    />
                </Col>
                <Col md={4} lg={3}>
                    <Form.Select
                        value={categoryId}
                        onChange={handleCategoryChange}
                        className="rounded-0 border-dark"
                        style={{ padding: '10px' }}
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            {products.length === 0 && !loading ? (
                <div className="text-center py-5 text-muted">
                    <p className="fs-5">Không tìm thấy sản phẩm nào phù hợp.</p>
                </div>
            ) : (
                <>
                    <Row className="g-4 mb-5">
                        {products.map((product) => (
                            <Col key={product.id} xs={6} md={4} lg={3}>
                                <Card className="h-100 shadow-sm rounded-0 border-0 product-card-hover">
                                    <div className="position-relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                                        <Card.Img
                                            variant="top"
                                            src={product.images?.length > 0 ? product.images[0].url : 'https://placehold.co/300x400/eeeeee/999999?text=No+Image'}
                                            alt={product.name}
                                            className="w-100 h-100 object-fit-cover"
                                            loading="lazy"
                                            style={{ transition: 'transform 0.3s ease' }}
                                        />
                                    </div>
                                    <Card.Body className="d-flex flex-column text-center bg-light">
                                        <Card.Text className="text-muted text-uppercase small mb-1" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                                            {product.categoryName}
                                        </Card.Text>
                                        <Card.Title className="fs-6 fw-bold mb-2 text-truncate" title={product.name}>
                                            {product.name}
                                        </Card.Title>
                                        <Card.Text className="fw-bold mb-3" style={{ color: '#d32f2f' }}>
                                            {formatVND(product.basePrice)}
                                        </Card.Text>
                                        <Button
                                            as={Link}
                                            to={`/products/${product.id}`}
                                            variant="outline-dark"
                                            className="mt-auto rounded-0 text-uppercase fw-semibold w-100"
                                            size="sm"
                                        >
                                            Xem chi tiết
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    
                    <div className="d-flex justify-content-center">
                        <ProductPagination
                            page={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                </>
            )}
        </Container>
    );
}

export default PublicProductList;
