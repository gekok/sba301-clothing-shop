import axios from "axios";

const CATEGORY_API_URL =
    "http://localhost:8080/api/v1/categories";

export const getCategories = () => {
    return axios.get(CATEGORY_API_URL);
};