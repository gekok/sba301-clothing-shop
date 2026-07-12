import { useEffect, useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { getCategories } from "../service/categoryService";

import ProductForm from "../components/ProductForm";
import {
    getProductById,
    updateProduct
} from "../service/productService";

function ProductEdit() {

    const { id } = useParams();

    const [categories, setCategories] = useState([]);

    const navigate = useNavigate();

    const [product, setProduct] = useState({
        categoryId: "",
        name: "",
        slug: "",
        description: "",
        brand: "",
        basePrice: "",
        status: "DRAFT"
    });

    const [errors, setErrors] = useState({});

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
                status: productData.status ?? "DRAFT"
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

    // Cập nhật state khi người dùng thay đổi dữ liệu trên form
    const handleChange = (event) => {

        const { name, value } = event.target;

        setProduct((currentProduct) => ({
            ...currentProduct,
            [name]: value
        }));

        setErrors((currentErrors) => ({
            ...currentErrors,
            [name]: ""
        }));

    };

    // Kiểm tra dữ liệu trước khi gửi lên backend
    const validate = () => {

        const newErrors = {};

        if (!product.name.trim()) {
            newErrors.name = "Product name is required";
        }

        if (!product.slug.trim()) {
            newErrors.slug = "Slug is required";
        }

        if (!product.categoryId) {
            newErrors.categoryId = "Category is required";
        }

        if (
            product.basePrice === "" ||
            Number(product.basePrice) <= 0
        ) {
            newErrors.basePrice =
                "Base price must be greater than 0";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;

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
                ...product,
                categoryId: Number(product.categoryId),
                basePrice: Number(product.basePrice)
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

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <p className="text-muted mb-1">
                        Product Management
                    </p>

                    <h2 className="mb-0">
                        Edit Product
                    </h2>

                </div>

                <Button
                    variant="outline-dark"
                    onClick={() =>
                        navigate("/admin/products")
                    }
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
                submitText="Update Product"
                submitting={submitting}
            />

        </div>

    );

}

export default ProductEdit;