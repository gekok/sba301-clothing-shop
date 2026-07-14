import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import ProductVariantTable from "../components/ProductVariantTable";
import { getProductById } from "../service/productService";

function ProductDetail() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [product, setProduct] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadProduct();

    }, [id]);

    const loadProduct = async () => {

        try {

            const response = await getProductById(id);

            setProduct(response.data);

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

    return (

        <div className="container mt-4">

            <Button
                variant="outline-dark"
                onClick={() => navigate("/admin/products")}
            >
                Back
            </Button>

            <h2 className="mt-4">

                {product.name}

            </h2>

            <hr/>

            <p>

                <strong>Brand:</strong>

                {product.brand}

            </p>

            <p>

                <strong>Category:</strong>

                {product.categoryName}

            </p>

            <p>

                <strong>Price:</strong>

                {product.basePrice}

            </p>

            <p>

                <strong>Description:</strong>

                {product.description}

            </p>

            <ProductVariantTable

                variants={product.variants}

            />

        </div>

    );

}

export default ProductDetail;