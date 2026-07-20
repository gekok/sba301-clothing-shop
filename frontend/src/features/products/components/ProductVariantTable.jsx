import { useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { formatVND } from "../../../shared/utils/format.js";
import { createVariant, updateVariant, deleteVariant } from "../service/variantService";

function ProductVariantTable({ productId, variants = [], onVariantChanged }) {
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentVariant, setCurrentVariant] = useState({
        sku: "",
        size: "",
        color: "",
        price: 0,
        stockQuantity: 0,
        isActive: true
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleClose = () => {
        setShowModal(false);
        setError("");
        setCurrentVariant({ sku: "", size: "", color: "", price: 0, stockQuantity: 0, isActive: true });
    };

    const handleShowAdd = () => {
        setIsEdit(false);
        setCurrentVariant({ sku: "", size: "", color: "", price: 0, stockQuantity: 0, isActive: true });
        setShowModal(true);
    };

    const handleShowEdit = (variant) => {
        setIsEdit(true);
        setCurrentVariant({ ...variant });
        setShowModal(true);
    };

    const capitalize = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = type === "checkbox" ? checked : value;

        if (name === "sku") {
            finalValue = value.toUpperCase();
            const parts = finalValue.split("-");
            
            // Nếu SKU có chứa dấu '-' phân tách, ví dụ: VAY-HOA-XL-RED
            // Tự động tách size và color từ 2 thành phần cuối cùng
            if (parts.length >= 3) {
                setCurrentVariant(prev => ({
                    ...prev,
                    sku: finalValue,
                    size: capitalize(parts[parts.length - 2]),
                    color: capitalize(parts[parts.length - 1])
                }));
                return;
            }
        } else if (name === "size" || name === "color") {
            finalValue = capitalize(value);
        }

        setCurrentVariant(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            if (isEdit) {
                await updateVariant(currentVariant.id, currentVariant);
            } else {
                await createVariant(productId, currentVariant);
            }
            if (onVariantChanged) {
                onVariantChanged();
            }
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save variant.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (variantId) => {
        if (window.confirm("Are you sure you want to delete this variant?")) {
            try {
                await deleteVariant(variantId);
                if (onVariantChanged) {
                    onVariantChanged();
                }
            } catch (err) {
                alert(err.response?.data?.message || "Failed to delete variant.");
            }
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
                <h4 className="fw-bold text-uppercase mb-0" style={{ letterSpacing: "0.05em" }}>Product Variants</h4>
                <Button 
                    variant="dark"
                    className="rounded-0 text-uppercase"
                    style={{ fontSize: "0.85rem", letterSpacing: "0.05em", padding: "8px 16px" }}
                    onClick={handleShowAdd}
                >
                    Add Variant
                </Button>
            </div>

            <div className="product-table-wrapper">
            <Table responsive hover className="product-table align-middle">
                <thead className="bg-light">
                    <tr>
                        <th>SKU</th>
                        <th>Size</th>
                        <th>Color</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {variants.map(variant => (
                        <tr key={variant.id}>
                            <td>{variant.sku}</td>
                            <td>{variant.size}</td>
                            <td>{variant.color}</td>
                            <td>{formatVND(variant.price)}</td>
                            <td>{variant.stockQuantity}</td>
                            <td>
                                <div className="d-flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="dark"
                                        className="rounded-0 text-uppercase"
                                        style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
                                        onClick={() => handleShowEdit(variant)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline-danger"
                                        className="rounded-0 text-uppercase"
                                        style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
                                        onClick={() => handleDelete(variant.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            </div>

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold text-uppercase" style={{ letterSpacing: "0.05em" }}>
                        {isEdit ? "Edit Variant" : "Add Variant"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>SKU</Form.Label>
                            <Form.Control
                                type="text"
                                name="sku"
                                value={currentVariant.sku}
                                onChange={handleChange}
                                className="rounded-0 border-dark"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Size (Tự động theo SKU)</Form.Label>
                            <Form.Control
                                type="text"
                                name="size"
                                value={currentVariant.size}
                                onChange={handleChange}
                                className="rounded-0 border-dark"
                                readOnly
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Color (Tự động theo SKU)</Form.Label>
                            <Form.Control
                                type="text"
                                name="color"
                                value={currentVariant.color}
                                onChange={handleChange}
                                className="rounded-0 border-dark"
                                readOnly
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="number"
                                name="price"
                                min="0"
                                value={currentVariant.price}
                                onChange={handleChange}
                                className="rounded-0 border-dark"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Stock Quantity</Form.Label>
                            <Form.Control
                                type="number"
                                name="stockQuantity"
                                min="0"
                                value={currentVariant.stockQuantity}
                                onChange={handleChange}
                                className="rounded-0 border-dark"
                                required
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button 
                                variant="outline-dark" 
                                onClick={handleClose} 
                                className="me-2 rounded-0 text-uppercase"
                                style={{ fontSize: "0.85rem", letterSpacing: "0.05em", padding: "8px 16px" }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="dark" 
                                type="submit" 
                                className="rounded-0 text-uppercase"
                                style={{ fontSize: "0.85rem", letterSpacing: "0.05em", padding: "8px 16px" }}
                                disabled={submitting}
                            >
                                {submitting ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default ProductVariantTable;