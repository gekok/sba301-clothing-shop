import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../layout/PublicLayout";
import { authRoutes } from "../../features/auth/routes";
import CartExperience from "../../features/cart/components/CartExperience/CartExperience";
import CheckoutLayout from "../../features/checkout/components/CheckoutLayout";

export const router = createBrowserRouter([
    {
        element: <PublicLayout />,
        children: [
            ...authRoutes,
            {
                path: "/cart",
                element: <CartExperience />
            },
            {
                path: "/checkout",
                element: <CheckoutLayout />
            }
        ]
    }
]);