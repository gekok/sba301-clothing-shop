import api from "../../../shared/services/axios";

const BASE_URL_V2 = "/api/admin/v2/products";

export const createVariant = (productId, variantData) => {
    return api.post(`${BASE_URL_V2}/${productId}/variants`, variantData);
};

export const updateVariant = (variantId, variantData) => {
    return api.put(`${BASE_URL_V2}/variants/${variantId}`, variantData);
};

export const deleteVariant = (variantId) => {
    return api.delete(`${BASE_URL_V2}/variants/${variantId}`);
};
