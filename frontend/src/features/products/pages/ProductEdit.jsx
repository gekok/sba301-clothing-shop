import { useEffect, useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { getCategories } from "../service/categoryService";

import ProductForm from "../components/ProductForm";
import {
    getProductById,
    updateProduct
} from "../service/productService";
import useProductForm from "../hooks/useProductForm.js";
import "../styles/product.css";

function ProductEdit() {

    const { id } = useParams();

    const [categories, setCategories] = useState([]);

    const navigate = useNavigate();

    const {
        product,
        setProduct,
        errors,
        handleChange,
        validate
    } = useProductForm();

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [serverError, setServerError] = useState("");

    useEffect(() => {

        loadProduct();

        loadCategories();

    }, [id]);

    const loadCategories = async () => {
        try {
            const response = await getCategories();

            console.log("Categories:", response.data);

            setCategories(response.data);
        } catch (error) {
            console.error("Unable to load categories:", error);
        }
    };

    // Lấy thông tin sản phẩm theo id
    const loadProduct = async () => {

        try {

            setLoading(true);

            setServerError("");

            const response = await getProductById(id);

            const productData = response.data;

            setProduct({
                categoryId: productData.categoryId ?? "",
                name: productData.name ?? "",
                slug: productData.slug ?? "",
                description: productData.description ?? "",
                brand: productData.brand ?? "",
                basePrice: productData.basePrice ?? "",
                status: productData.status ?? "DRAFT",
                imageUrl:
                    productData.images?.find(
                        (image) => image.isPrimary
                    )?.url ||
                    productData.images?.[0]?.url ||
                    ""
            });

        } catch (error) {

            console.error(error);

            setServerError(
                error.response?.data?.message ||
                "Unable to load product"
            );

        } finally {

            setLoading(false);

        }

    };



    // Gửi yêu cầu cập nhật sản phẩm
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

            await updateProduct(id, requestData);

            navigate("/admin/products");

        } catch (error) {

            console.error(error);

            setServerError(
                error.response?.data?.message ||
                "Unable to update product"
            );

        } finally {

            setSubmitting(false);

        }

    };

    if (loading) {

        return (
            <div className="text-center mt-5">

                <Spinner animation="border" />

                <p className="mt-2">
                    Loading product...
                </p>

            </div>
        );

    }

    return (
        <div className="container mt-4">
            <div className="card rounded-0 mb-4">
                <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h2 className="fw-bold text-uppercase mb-0" style={{ letterSpacing: "0.05em" }}>
                        Edit Product
                    </h2>

                </div>

                <Button
                    variant="outline-dark"
                    className="rounded-0 text-uppercase"
                    style={{ fontSize: "0.85rem", letterSpacing: "0.05em", padding: "8px 16px" }}
                    onClick={() =>
                        navigate("/admin/products")
                    }
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
                submitText="Update Product"
                submitting={submitting}
            />

        </div>

    );

}

export default ProductEdit;