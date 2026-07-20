import Badge from "react-bootstrap/Badge";

function ProductStatusBadge({ status }) {

    let bg = "secondary";
    let text = status;

    switch (status) {

        case "ACTIVE":
            bg = "success";
            text = "ACTIVE";
            break;

        case "INACTIVE":
            bg = "danger";
            text = "INACTIVE";
            break;

        case "OUT_OF_STOCK":
            bg = "warning";
            text = "OUT OF STOCK";
            break;

        case "DRAFT":
            bg = "secondary";
            text = "DRAFT";
            break;

        default:
            bg = "dark";
            text = status;

    }

    return (

        <Badge bg={bg}>
            {text}
        </Badge>

    );

}

export default ProductStatusBadge;