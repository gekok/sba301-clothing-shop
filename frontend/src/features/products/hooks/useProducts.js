import { useEffect, useState } from "react";
import {
    deleteProduct,
    getProducts
} from "../service/productService";

function useProducts(initialConfig = {}) {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);

    const [size] = useState(10);

    const [totalPages, setTotalPages] = useState(0);

    const [totalElements, setTotalElements] = useState(0);

    const [categoryId, setCategoryId] = useState(initialConfig.categoryId || "");

    const [status, setStatus] = useState(initialConfig.status || "");

    const [keyword, setKeyword] = useState("");

    const [sortBy, setSortBy] = useState("id");

    const [direction, setDirection] = useState("asc");

    const loadProducts = async (
        currentPage = page,
        currentKeyword = keyword,
        currentCategoryId = categoryId,
        currentStatus = status
    ) => {

        try {

            setLoading(true);

            const response = await getProducts(
                currentPage,
                size,
                currentKeyword,
                currentCategoryId,
                currentStatus,
                sortBy,
                direction
            );

            setProducts(response.data.content);

            setPage(response.data.number);

            setTotalPages(response.data.totalPages);

            setTotalElements(response.data.totalElements);

        } catch (error) {

            console.error("Unable to load products:", error);

        } finally {

            setLoading(false);

        }

    };

    const changeSort = (value) => {

        const [field, dir] = value.split(",");

        setPage(0);

        setSortBy(field);

        setDirection(dir);

    };

    useEffect(() => {

        loadProducts(
            page,
            keyword,
            categoryId,
            status
        );

    }, [
        page,
        keyword,
        categoryId,
        status,
        sortBy,
        direction
    ]);

    const searchProducts = (value) => {

        setPage(0);

        setKeyword(value);

    };

    const filterByCategory = (value) => {

        setPage(0);

        setCategoryId(value);

    };

    const filterByStatus = (value) => {

        setPage(0);

        setStatus(value);

    };

    const handleDelete = async (id) => {

        try {

            await deleteProduct(id);

            await loadProducts(
                page,
                keyword,
                categoryId,
                status
            );

        } catch (error) {

            console.error(
                "Unable to delete product:",
                error
            );

        }

    };

    return {

        products,

        loading,

        page,

        setPage,

        totalPages,

        totalElements,

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

    };

}

export default useProducts;