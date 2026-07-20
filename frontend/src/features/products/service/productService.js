import api from "../../../shared/services/axios";

const PRODUCT_URL = "/api/admin/products";
const PRODUCT_URL_V2 = "/api/admin/v2/products";

export const getProducts = (
    page = 0,
    size = 10,
    keyword = "",
    categoryId = "",
    status = "",
    sortBy = "id",
    direction = "asc"
) => {
    return api.get(PRODUCT_URL, {
        params: {
            page,
            size,
            keyword: keyword.trim() || undefined,
            categoryId: categoryId || undefined,
            status: status || undefined,
            sortBy,
            direction
        }
    });
};

export const getProductById = (id) => {
    return api.get(`${PRODUCT_URL}/${id}`);
};

export const uploadProductImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    
    return api.post("/api/admin/v2/products/upload-image", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

export const createProduct = (product) => {
    return api.post(PRODUCT_URL_V2, product);
};

export const updateProduct = (id, product) => {
    return api.put(`${PRODUCT_URL_V2}/${id}`, product);
};

export const deleteProduct = (id) => {
    return api.delete(`${PRODUCT_URL}/${id}`);
};