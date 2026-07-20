import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function ProductDeleteModal({

                                show,

                                onHide,

                                onConfirm,

                                product

                            }) {

    return (

        <Modal
            show={show}
            onHide={onHide}
            centered
        >

            <Modal.Header closeButton>

                <Modal.Title>
                    Delete Product
                </Modal.Title>

            </Modal.Header>

            <Modal.Body>

                {product && (

                    <>
                        Are you sure you want to delete

                        <strong>
                            {" "}
                            {product.name}
                        </strong>

                        ?

                    </>

                )}

            </Modal.Body>

            <Modal.Footer>

                <Button
                    variant="secondary"
                    onClick={onHide}
                >
                    Cancel
                </Button>

                <Button
                    variant="danger"
                    onClick={onConfirm}
                >
                    Delete
                </Button>

            </Modal.Footer>

        </Modal>

    );

}

export default ProductDeleteModal;