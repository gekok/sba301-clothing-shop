import { Form, Row, Col, Button } from "react-bootstrap";
import "../styles/product-form.css";

function ProductForm({
                         product,
                         categories = [],
                         onChange,
                         onSubmit,
                         submitText = "Save",
                         submitting = false,
                         errors = {}
                     }) {
    return (
        <div className="card rounded-0 mb-4 p-4 shadow-sm border-0">
        <Form onSubmit={onSubmit}>
            <Row>
                <Col md={6}>
                    <Form.Group className="product-form-group">
                        <Form.Label className="product-form-label">Product Name</Form.Label>

                        <Form.Control
                            type="text"
                            name="name"
                            className="product-form-field"
                            value={product.name}
                            onChange={onChange}
                            isInvalid={Boolean(errors.name)}
                            placeholder="Enter product name"
                        />

                        <Form.Control.Feedback type="invalid">
                            {errors.name}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group className="product-form-group">
                        <Form.Label className="product-form-label">Slug</Form.Label>

                        <Form.Control
                            type="text"
                            name="slug"
                            className="product-form-field"
                            value={product.slug}
                            onChange={onChange}
                            isInvalid={Boolean(errors.slug)}
                            placeholder="ao-polo-nam"
                        />

                        <Form.Control.Feedback type="invalid">
                            {errors.slug}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="product-form-group">
                        <Form.Label className="product-form-label">Brand</Form.Label>

                        <Form.Control
                            type="text"
                            name="brand"
                            className="product-form-field"
                            value={product.brand}
                            onChange={onChange}
                            placeholder="Enter brand"
                        />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group className="product-form-group">
                        <Form.Label className="product-form-label">Category</Form.Label>

                        <Form.Select
                            name="categoryId"
                            className="product-form-select"
                            value={product.categoryId}
                            onChange={onChange}
                            isInvalid={Boolean(errors.categoryId)}
                        >
                            <option value="">
                                Select category
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </Form.Select>

                        <Form.Control.Feedback type="invalid">
                            {errors.categoryId}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="product-form-group">
                        <Form.Label className="product-form-label">Base Price</Form.Label>

                        <Form.Control
                            type="number"
                            min="0"
                            name="basePrice"
                            className="product-form-field"
                            value={product.basePrice}
                            onChange={onChange}
                            isInvalid={Boolean(errors.basePrice)}
                            placeholder="Enter product price"
                        />

                        <Form.Control.Feedback type="invalid">
                            {errors.basePrice}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group className="product-form-group">
                        <Form.Label className="product-form-label">Status</Form.Label>

                        <Form.Select
                            name="status"
                            className="product-form-select"
                            value={product.status}
                            onChange={onChange}
                        >
                            <option value="DRAFT">DRAFT</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="HIDDEN">HIDDEN</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="product-form-group">
                <Form.Label className="product-form-label">Product Image</Form.Label>
                <Form.Control
                    type="file"
                    className="product-form-field"
                    accept="image/*"
                    onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            try {
                                const { uploadProductImage } = await import("../service/productService");
                                const response = await uploadProductImage(file);
                                // Simulate an event to update parent state
                                onChange({
                                    target: {
                                        name: "imageUrl",
                                        value: response.data.url
                                    }
                                });
                            } catch (error) {
                                console.error("Upload failed", error);
                                alert("Failed to upload image. Please try again.");
                            }
                        }
                    }}
                />
                {product.imageUrl && (
                    <div className="product-form-img-preview mt-2">
                        <img 
                            src={product.imageUrl} 
                            alt="Product Preview" 
                            style={{ width: "100%", display: "block" }} 
                        />
                    </div>
                )}
            </Form.Group>

            <Form.Group className="product-form-group">
                <Form.Label className="product-form-label">Description</Form.Label>

                <Form.Control
                    as="textarea"
                    rows={5}
                    name="description"
                    className="product-form-field product-form-textarea"
                    value={product.description}
                    onChange={onChange}
                    placeholder="Enter product description"
                />
            </Form.Group>

            <div className="d-flex gap-2 mt-4">
                <Button
                    type="submit"
                    variant="dark"
                    className="rounded-0 text-uppercase"
                    style={{ fontSize: "0.85rem", letterSpacing: "0.05em", padding: "10px 24px" }}
                    disabled={submitting}
                >
                    {submitting ? "Saving..." : submitText}
                </Button>
            </div>
        </Form>
        </div>
    );
}

export default ProductForm;