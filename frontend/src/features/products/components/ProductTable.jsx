import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { formatPrice } from "../utils/productFormatter";
import ProductStatusBadge from "./ProductStatusBadge.jsx";
import { useNavigate } from "react-router-dom";

function ProductTable({ products, onEdit, onDelete }) {

    const navigate = useNavigate();

    return (
        <Table striped bordered hover responsive>

            <thead>

            <tr>

                <th>ID</th>

                <th>Image</th>

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

                        <td style={{ width: "100px" }}>

                            <img
                                src={
                                    product.images?.length > 0
                                        ? product.images[0].imageUrl
                                        : "/images/no-image.png"
                                }
                                alt={product.name}
                                width={70}
                                height={70}
                                className="rounded border"
                            />

                        </td>

                        <td>{product.name}</td>

                        <td>{product.brand}</td>

                        <td>{product.categoryName}</td>

                        <td className="fw-bold text-primary">
                            {formatPrice(product.basePrice)}
                        </td>

                        <td>

                            <ProductStatusBadge
                                status={product.status}
                            />

                        </td>

                        <td>

                            <Button
                                size="sm"
                                variant="warning"
                                className="me-2"
                                onClick={() => onEdit(product)}
                            >
                                Edit
                            </Button>

                            <Button

                                size="sm"

                                variant="danger"

                                onClick={() => onDelete(product)}

                            >

                                Delete

                            </Button>

                            <Button

                                size="sm"

                                variant="info"

                                className="me-2"

                                onClick={() => navigate(`/admin/products/${product.id}`)}

                            >

                                Detail

                            </Button>

                        </td>

                    </tr>

                ))
            }

            </tbody>

        </Table>
    );

}

export default ProductTable;