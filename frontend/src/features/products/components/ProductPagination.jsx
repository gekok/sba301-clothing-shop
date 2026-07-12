import Pagination from "react-bootstrap/Pagination";

function ProductPagination({

                               page,

                               totalPages,

                               onPageChange

                           }) {

    if (totalPages <= 1) {

        return null;

    }

    return (

        <Pagination className="justify-content-center mt-4">

            <Pagination.Prev

                disabled={page === 0}

                onClick={() => onPageChange(page - 1)}

            />

            {

                [...Array(totalPages)].map((_, index) => (

                    <Pagination.Item

                        key={index}

                        active={page === index}

                        onClick={() => onPageChange(index)}

                    >

                        {index + 1}

                    </Pagination.Item>

                ))

            }

            <Pagination.Next

                disabled={page === totalPages - 1}

                onClick={() => onPageChange(page + 1)}

            />

        </Pagination>

    );

}

export default ProductPagination;