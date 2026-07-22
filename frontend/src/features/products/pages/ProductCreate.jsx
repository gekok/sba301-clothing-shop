import { useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import ProductForm from "../components/ProductForm";
import useProductForm from "../hooks/useProductForm";
import { createProduct } from "../service/productService";
import { useEffect } from "react";
import { getCategories } from "../service/categoryService";
import "../styles/product.css";

function ProductCreate() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    const {
        product,
        errors,
        handleChange,
        validate
    } = useProductForm();

    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setSubmitting(true);
            setServerError("");

            const requestData = {
                categoryId: Number(product.categoryId),
                name: product.name,
                slug: product.slug,
                description: product.description,
                brand: product.brand,
                basePrice: Number(product.basePrice),
                status: product.status,
                images: product.imageUrl.trim()
                    ? [
                        {
                            url: product.imageUrl.trim(),
                            displayOrder: 0,
                            isPrimary: true
                        }
                    ]
                    : []
            };

            await createProduct(requestData);

            navigate("/admin/products");
        } catch (error) {
            console.error(error);

            setServerError(
                error.response?.data?.message ||
                "Unable to create product"
            );
        } finally {
            setSubmitting(false);
        }
    };
    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await getCategories();

            const categoryData = Array.isArray(response.data)
                ? response.data
                : response.data.content ?? [];

            setCategories(categoryData);
        } catch (error) {
            console.error("Unable to load categories:", error);
            setServerError("Unable to load categories");
        }
    };

    return (
        <div className="container mt-4">
            <div className="card rounded-0 mb-4">
                <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h2 className="fw-bold text-uppercase mb-0" style={{ letterSpacing: "0.05em" }}>
                        Create Product
                    </h2>
                </div>

                <Button
                    variant="outline-dark"
                    className="rounded-0 text-uppercase"
                    style={{ fontSize: "0.85rem", letterSpacing: "0.05em", padding: "8px 16px" }}
                    onClick={() => navigate("/admin/products")}
                >
                    Back to List
                </Button>
                </div>
            </div>

            {serverError && (
                <Alert variant="danger">
                    {serverError}
                </Alert>
            )}

            <ProductForm
                product={product}
                categories={categories}
                errors={errors}
                onChange={handleChange}
                onSubmit={handleSubmit}
                submitText="Create Product"
                submitting={submitting}
            />
        </div>
    );
}

export default ProductCreate;