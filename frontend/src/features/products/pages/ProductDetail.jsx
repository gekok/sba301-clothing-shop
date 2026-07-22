import { useEffect, useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import ProductVariantTable from "../components/ProductVariantTable";
import { getProductById } from "../service/productService";
import {formatVND} from "../../../shared/utils/format.js";
import "../styles/product.css";

function ProductDetail() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [product, setProduct] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    useEffect(() => {

        loadProduct();

    }, [id]);

    const loadProduct = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await getProductById(id);

            setProduct(response.data);

        } catch (error) {

            console.error("Unable to load product:", error);

            setProduct(null);

            setError(
                error.response?.data?.message ||
                "Product does not exist or has been deleted."
            );

        } finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <div className="text-center mt-5">

                <Spinner animation="border"/>

            </div>

        );

    }

    if (error || !product) {

        return (

            <div className="container mt-4">

                <Alert variant="danger">

                    {error || "Product not found."}

                </Alert>

                <Button
                    variant="outline-dark"
                    className="rounded-1 fw-bold"
                    onClick={() => navigate("/admin/products")}
                >
                    Back to Product List
                </Button>

            </div>

        );

    }

    return (

        <div className="container mt-4">

            <Button
                variant="outline-dark"
                className="mb-4 rounded-0 text-uppercase"
                style={{ fontSize: "0.85rem", letterSpacing: "0.05em", padding: "8px 16px" }}
                onClick={() => navigate("/admin/products")}
            >
                Back
            </Button>
            
            <div className="card rounded-0 mb-4 p-4 shadow-sm border-0">
                <h2 className="fw-bold text-uppercase mb-4" style={{ letterSpacing: "0.05em" }}>
                    {product.name}
                </h2>

                <div className="d-flex gap-4">
                    {product.images?.length > 0 && (
                        <div>
                            <img
                                src={
                                    product.images.find(
                                        (image) => image.isPrimary
                                    )?.url ||
                                    product.images[0].url
                                }
                                alt={product.name}
                                style={{
                                    width: "300px",
                                    height: "350px",
                                    objectFit: "cover"
                                }}
                                className="product-detail-img"
                            />
                        </div>
                    )}
                    
                    <div>
                        <p>
                            <strong>Brand:</strong> {product.brand}
                        </p>
                        <p>
                            <strong>Category:</strong> {product.categoryName}
                        </p>
                        <p>
                            <strong>Price:</strong> {formatVND(product.basePrice)}
                        </p>
                    </div>
                </div>
            </div>

            <ProductVariantTable
                productId={product.id}
                variants={product.variants}
                onVariantChanged={loadProduct}
            />

        </div>

    );

}

export default ProductDetail;