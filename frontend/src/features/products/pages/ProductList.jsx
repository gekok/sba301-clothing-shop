import { useState } from "react";
import ProductPagination from "../components/ProductPagination";
import Button from "react-bootstrap/Button";
import ProductTable from "../components/ProductTable.jsx";
import useProducts from "../hooks/useProducts.js";
import ProductDeleteModal from "../components/ProductDeleteModal";
import { useNavigate } from "react-router-dom";

function ProductList() {

    const navigate = useNavigate();

    const [keyword, setKeyword] = useState("");

    const [showDelete, setShowDelete] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const {

        products,

        loading,

        page,

        setPage,

        totalPages,

        loadProducts,

        handleDelete

    } = useProducts();
    if(loading){

        return <h3>Loading...</h3>;

    }
    return (
        <div className="container mt-4">

            <div className="d-flex justify-content-between align-items-center mb-3">

                <div>
                    <h2 className="mb-3">Product Management</h2>

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by product name..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{ width: "320px" }}
                    />
                </div>

                <div>

                    <Button
                        variant="secondary"
                        className="me-2"
                        onClick={loadProducts}
                    >
                        Refresh
                    </Button>

                    <Button
                        variant="primary"
                        onClick={() => navigate("/admin/products/create")}
                    >
                        Add Product
                    </Button>

                </div>

            </div>

            <ProductTable products={products.filter(p =>
                p.name.toLowerCase().includes(keyword.toLowerCase())
            )}
                          onEdit={(product) =>
                              navigate(`/admin/products/${product.id}/edit`)
            }
                          onDelete={(product)=>{
                              setSelectedProduct(product);

                              setShowDelete(true);

            }}
            />

            <ProductPagination

                page={page}

                totalPages={totalPages}

                onPageChange={setPage}

            />

            <ProductDeleteModal

                show={showDelete}

                product={selectedProduct}

                onHide={() => setShowDelete(false)}

                onConfirm={async () => {

                    await handleDelete(selectedProduct.id);

                    setShowDelete(false);

                }}

            />

        </div>
    );

}

export default ProductList;