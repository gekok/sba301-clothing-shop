import Badge from "react-bootstrap/Badge";

function ProductStatusBadge({ status }) {

    const statusConfig = {
        ACTIVE: {
            variant: "success",
            label: "ACTIVE"
        },

        DRAFT: {
            variant: "warning",
            label: "DRAFT"
        },

        HIDDEN: {
            variant: "secondary",
            label: "HIDDEN"
        }
    };

    const config = statusConfig[status] || {
        variant: "dark",
        label: status || "UNKNOWN"
    };

    return (
        <Badge bg={config.variant}>
            {config.label}
        </Badge>
    );
}

export default ProductStatusBadge;