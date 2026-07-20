import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";

function ProductVariantTable({ variants }) {

    return (

        <>

            <div className="d-flex justify-content-between align-items-center mt-5 mb-3">

                <h4>

                    Product Variants

                </h4>

                <Button>

                    Add Variant

                </Button>

            </div>

            <Table bordered hover>

                <thead>

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

                {

                    variants.map(variant => (

                        <tr key={variant.id}>

                            <td>{variant.sku}</td>

                            <td>{variant.size}</td>

                            <td>{variant.color}</td>

                            <td>{variant.price}</td>

                            <td>{variant.stockQuantity}</td>

                            <td>

                                <Button
                                    size="sm"
                                    variant="warning"
                                    className="me-2"
                                >

                                    Edit

                                </Button>

                                <Button
                                    size="sm"
                                    variant="danger"
                                >

                                    Delete

                                </Button>

                            </td>

                        </tr>

                    ))

                }

                </tbody>

            </Table>

        </>

    );

}

export default ProductVariantTable;