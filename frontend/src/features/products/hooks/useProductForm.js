import { useState } from "react";

const initialProduct = {
    categoryId: "",
    name: "",
    slug: "",
    description: "",
    brand: "",
    basePrice: "",
    status: "DRAFT"
};

function useProductForm(initialData = initialProduct) {
    const [product, setProduct] = useState(initialData);
    const [errors, setErrors] = useState({});

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
            newErrors.basePrice = "Base price must be greater than 0";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setProduct(initialProduct);
        setErrors({});
    };

    return {
        product,
        setProduct,
        errors,
        handleChange,
        validate,
        resetForm
    };
}

export default useProductForm;