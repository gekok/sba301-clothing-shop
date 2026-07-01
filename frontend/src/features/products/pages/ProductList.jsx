import { useEffect, useState } from "react";
import { getProducts } from "../service/productService";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";

function ProductList() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    // Load dữ liệu khi component được render lần đầu
    useEffect(() => {
        loadProducts();
    }, []);

    // Hàm gọi API lấy danh sách sản phẩm
    const loadProducts = async () => {

        try {

            setLoading(true);

            const response = await getProducts();

            setProducts(response.data.content);

            console.log(response.data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    };
    if(loading){

        return <h3>Loading...</h3>;

    }
    return (
        <div className="container mt-4">

            <div className="d-flex justify-content-between align-items-center mb-3">

                <h2>Product Management</h2>

                <Button variant="primary">
                    Add Product
                </Button>

            </div>

            <Table striped bordered hover responsive>

                <thead>

                <tr>

                    <th>ID</th>

                    <th>Name</th>

                    <th>Brand</th>

                    <th>Category</th>

                    <th>Price</th>

                    <th>Status</th>

                    <th>Action</th>

                </tr>

                </thead>

                <tbody>

                {
                    products.map(product => (

                        <tr key={product.id}>

                            <td>{product.id}</td>

                            <td>{product.name}</td>

                            <td>{product.brand}</td>

                            <td>{product.categoryName}</td>

                            <td>{product.basePrice}</td>

                            <td>

                                <Badge bg="success">

                                    {product.status}

                                </Badge>

                            </td>

                            <td>

                                <Button
                                    size="sm"
                                    variant="warning"
                                    className="me-2">

                                    Edit

                                </Button>

                                <Button
                                    size="sm"
                                    variant="danger">

                                    Delete

                                </Button>

                            </td>

                        </tr>

                    ))
                }

                </tbody>

            </Table>

        </div>
    );

}

export default ProductList;