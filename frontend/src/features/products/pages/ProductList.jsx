import { useState, useEffect } from "react";
import ProductPagination from "../components/ProductPagination";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { getCategories } from "../service/categoryService.js";
import ProductTable from "../components/ProductTable.jsx";
import useProducts from "../hooks/useProducts.js";
import ProductDeleteModal from "../components/ProductDeleteModal";
import { useNavigate } from "react-router-dom";
import "../styles/product.css";

function ProductList() {

    const navigate = useNavigate();

    const [searchInput, setSearchInput] = useState("");

    const [showDelete, setShowDelete] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [categories, setCategories] = useState([]);

    const {
        products,
        loading,
        page,
        setPage,
        totalPages,
        keyword,
        categoryId,
        status,
        sortBy,
        direction,
        searchProducts,
        filterByCategory,
        filterByStatus,
        changeSort,
        loadProducts,
        handleDelete
    } = useProducts();

    useEffect(() => {

        const timeoutId = setTimeout(() => {

            searchProducts(searchInput);

        }, 400);

        return () => clearTimeout(timeoutId);

    }, [searchInput]);

    useEffect(() => {

        const loadCategories = async () => {

            try {

                const response = await getCategories();

                setCategories(response.data);

            } catch (error) {

                console.error(
                    "Unable to load categories:",
                    error
                );

            }

        };

        loadCategories();

    }, []);

    if (loading) {

        return <h3>Loading...</h3>;

    }

    return (
        <div className="container mt-4">

            <div className="card rounded-0 mb-4">
                <div className="card-body d-flex justify-content-between align-items-center">

                <div>

                    <h2 className="fw-bold text-uppercase mb-3" style={{ letterSpacing: "0.05em" }}>
                        Product Management
                    </h2>

                    <div className="d-flex gap-3 mt-3">

                        <Form.Control
                            type="text"
                            placeholder="Search by product name..."
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(event.target.value)
                            }
                            className="rounded-0 border-dark"
                            style={{ width: "320px", padding: "10px" }}
                        />

                        <Form.Select
                            value={categoryId}
                            onChange={(event) =>
                                filterByCategory(event.target.value)
                            }
                            className="rounded-0 border-dark"
                            style={{ width: "200px", padding: "10px" }}
                        >
                            <option value="">
                                All Categories
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            value={status}
                            onChange={(event) =>
                                filterByStatus(event.target.value)
                            }
                            className="rounded-0 border-dark"
                            style={{ width: "180px", padding: "10px" }}
                        >
                            <option value="">
                                All Status
                            </option>

                            <option value="ACTIVE">
                                ACTIVE
                            </option>

                            <option value="DRAFT">
                                DRAFT
                            </option>

                            <option value="HIDDEN">
                                HIDDEN
                            </option>
                        </Form.Select>



                    </div>

                </div>

                <div className="d-flex flex-column align-items-end">

                    <div className="d-flex gap-2">
                    <Button
                        variant="outline-dark"
                        className="rounded-0 text-uppercase"
                        style={{ fontSize: "0.85rem", letterSpacing: "0.05em", padding: "10px 20px" }}
                        onClick={() =>
                            loadProducts(
                                page,
                                keyword,
                                categoryId,
                                status
                            )
                        }
                        disabled={loading}
                    >
                        Refresh
                    </Button>

                    <Button
                        variant="dark"
                        className="rounded-0 text-uppercase"
                        style={{ fontSize: "0.85rem", letterSpacing: "0.05em", padding: "10px 20px" }}
                        onClick={() =>
                            navigate("/admin/products/create")
                        }
                    >
                        Add Product
                    </Button>

                </div>

                </div>

            </div>

            <ProductTable
                products={products}
                onDelete={(product) => {

                    setSelectedProduct(product);

                    setShowDelete(true);

                }}
                onEdit={(product) =>
                    navigate(`/admin/products/${product.id}/edit`)
                }
                onDetail={(product) =>
                    navigate(`/admin/products/${product.id}`)
                }
            />

            <ProductPagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />

            <ProductDeleteModal
                show={showDelete}
                product={selectedProduct}
                onHide={() => {

                    setShowDelete(false);

                    setSelectedProduct(null);

                }}
                onConfirm={async () => {

                    if (!selectedProduct) {
                        return;
                    }

                    await handleDelete(selectedProduct.id);

                    setShowDelete(false);

                    setSelectedProduct(null);

                }}
            />
            </div>
        </div>
    );
}

export default ProductList;