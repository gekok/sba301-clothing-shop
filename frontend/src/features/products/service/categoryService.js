import api from "../../../shared/services/axios";

const CATEGORY_URL = "/categories";

export const getCategories = () => {
    return api.get(CATEGORY_URL);
};