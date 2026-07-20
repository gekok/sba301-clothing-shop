import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import ProductStatusBadge from "./ProductStatusBadge.jsx";
import { useNavigate } from "react-router-dom";
import {formatVND} from "../../../shared/utils/format.js";
import "../styles/product-table.css";

function ProductTable({ products, onEdit, onDelete }) {

    const navigate = useNavigate();

    return (
        <div className="product-table-wrapper">
            <Table responsive hover className="product-table align-middle">

                <thead className="bg-light">

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
                            {product.images?.length > 0 && product.images[0]?.url ? (
                                <img
                                    src={product.images[0].url}
                                    alt={product.images[0].alt || product.name}
                                    width={70}
                                    height={70}
                                    className="rounded border"
                                    style={{ objectFit: "cover" }}
                                    onError={(event) => {
                                        event.currentTarget.style.display = "none";
                                    }}
                                />
                            ) : (
                                <div
                                    className="rounded border text-muted d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "70px",
                                        height: "70px",
                                        fontSize: "12px"
                                    }}
                                >
                                    No Image
                                </div>
                            )}
                        </td>

                        <td>{product.name}</td>

                        <td>{product.brand}</td>

                        <td>{product.categoryName}</td>

                        <td className="fw-bold text-primary">
                            {formatVND(product.basePrice)}
                        </td>

                        <td>

                            <ProductStatusBadge
                                status={product.status}
                            />

                        </td>

                        <td>
                            <div className="d-flex gap-2">
                                <Button
                                    variant="outline-dark"
                                    size="sm"
                                    className="rounded-0 text-uppercase"
                                    style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
                                    onClick={() => navigate(`/admin/products/${product.id}`)}
                                >
                                    Detail
                                </Button>

                                <Button
                                    variant="dark"
                                    size="sm"
                                    className="rounded-0 text-uppercase"
                                    style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
                                    onClick={() => onEdit(product)}
                                >
                                    Edit
                                </Button>

                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="rounded-0 text-uppercase"
                                    style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
                                    onClick={() => onDelete(product)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </td>

                    </tr>

                ))
            }

            </tbody>

            </Table>
        </div>
    );

}

export default ProductTable;