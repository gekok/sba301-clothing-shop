import { useEffect, useState } from "react";
import {deleteProduct, getProducts} from "../service/productService";

function useProducts() {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);

    const [size] = useState(10);

    const [totalPages, setTotalPages] = useState(0);

    const [totalElements, setTotalElements] = useState(0);

    const loadProducts = async (currentPage = page) => {

        try {

            setLoading(true);

            const response = await getProducts(currentPage, size);

            setProducts(response.data.content);

            setPage(response.data.number);

            setTotalPages(response.data.totalPages);

            setTotalElements(response.data.totalElements);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadProducts(page);

    }, [page]);

    const handleDelete = async (id) => {

        try {

            await deleteProduct(id);

            loadProducts();

        } catch (error) {

            console.error(error);

        }

    };

    return {

        products,

        loading,

        page,

        setPage,

        totalPages,

        totalElements,

        loadProducts,

        handleDelete

    };

}

export default useProducts;