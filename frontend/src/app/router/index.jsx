import {createBrowserRouter} from "react-router-dom";
import PublicLayout from "../layout/PublicLayout";
import { authRoutes } from "../../features/auth/routes";
export const router = createBrowserRouter([
    {
        element: <PublicLayout />,
        children: [
            ...authRoutes,
        ]
    }
]);