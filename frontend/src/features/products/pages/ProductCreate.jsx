import { useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import ProductForm from "../components/ProductForm";
import useProductForm from "../hooks/useProductForm";
import { createProduct } from "../service/productService";
import { useEffect } from "react";
import { getCategories } from "../service/categoryService";

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
                ...product,
                categoryId: Number(product.categoryId),
                basePrice: Number(product.basePrice)
            };

            await createProduct(requestData);

            navigate("/products");
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <p className="text-muted mb-1">
                        Product Management
                    </p>

                    <h2 className="mb-0">
                        Create Product
                    </h2>
                </div>

                <Button
                    variant="outline-dark"
                    onClick={() => navigate("/products")}
                >
                    Back to List
                </Button>
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