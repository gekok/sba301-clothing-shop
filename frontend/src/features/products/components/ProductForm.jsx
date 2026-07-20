import { Form, Row, Col, Button } from "react-bootstrap";

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
        <Form onSubmit={onSubmit}>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Product Name</Form.Label>

                        <Form.Control
                            type="text"
                            name="name"
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
                    <Form.Group className="mb-3">
                        <Form.Label>Slug</Form.Label>

                        <Form.Control
                            type="text"
                            name="slug"
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
                    <Form.Group className="mb-3">
                        <Form.Label>Brand</Form.Label>

                        <Form.Control
                            type="text"
                            name="brand"
                            value={product.brand}
                            onChange={onChange}
                            placeholder="Enter brand"
                        />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>

                        <Form.Select
                            name="categoryId"
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
                    <Form.Group className="mb-3">
                        <Form.Label>Base Price</Form.Label>

                        <Form.Control
                            type="number"
                            min="0"
                            name="basePrice"
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
                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>

                        <Form.Select
                            name="status"
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

            <Form.Group className="mb-4">
                <Form.Label>Description</Form.Label>

                <Form.Control
                    as="textarea"
                    rows={5}
                    name="description"
                    value={product.description}
                    onChange={onChange}
                    placeholder="Enter product description"
                />
            </Form.Group>

            <div className="d-flex gap-2">
                <Button
                    type="submit"
                    variant="dark"
                    disabled={submitting}
                >
                    {submitting ? "Saving..." : submitText}
                </Button>
            </div>
        </Form>
    );
}

export default ProductForm;