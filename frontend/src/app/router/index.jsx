import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout.jsx";
import AdminLayout from "../layout/AdminLayout.jsx";
import StaffLayout from "../layout/StaffLayout.jsx";
import { authRoutes } from "../../features/auth/routes";
import { homeRoute, guestRoutes } from "../../features/guest/routes";

import ProductList from "../../features/products/pages/ProductList.jsx";
import CartExperience from "../../features/cart/components/CartExperience/CartExperience.jsx";
import CheckoutLayout from "../../features/checkout/components/CheckoutLayout.jsx";
import OrderManagement from "../../features/orders/pages/OrderManagement.jsx";
import Dashboard from "../../features/dashboard/pages/Dashboard.jsx";
import POS from "../../features/pos/pages/POS.jsx";
import AuditLogs from "../../features/audit-logs/pages/AuditLogs.jsx";
import AdminReviews from "../../features/reviews/pages/AdminReviews.jsx";
import ProductCreate from "../../features/products/pages/ProductCreate.jsx";
import ProductEdit from "../../features/products/pages/ProductEdit.jsx";
import ProductDetail from "../../features/products/pages/ProductDetail";
import CustomerProductDetail from "../../features/products/pages/CustomerProductDetail.jsx";
import MyOrders from "../../features/orders/pages/MyOrders.jsx";
import PublicProductList from "../../features/products/pages/PublicProductList.jsx";
import VNPayReturn from "../../features/checkout/components/VNPayReturn.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

// Route công khai — không cần đăng nhập. products/create giữ nguyên ở đây (không có prefix
// admin/) đúng như hiện trạng trước khi tách layout — không tự đổi guard cho route này, ngoài
// phạm vi (xem báo cáo kèm theo).
const publicRoutes = [
  { path: "products", element: <PublicProductList /> },
  { path: "products/create", element: <ProductCreate /> },
  { path: "products/:id", element: <CustomerProductDetail /> },
];

// Route cần đăng nhập CUSTOMER.
const customerRoutes = [
  { path: "cart", element: <CartExperience /> },
  { path: "checkout", element: <CheckoutLayout /> },
  { path: "checkout/vnpay-return", element: <VNPayReturn /> },
  { path: "my-orders", element: <MyOrders /> },
];

// Route khu vực quản trị — cần ADMIN.
const adminRoutes = [
  { path: "admin/dashboard", element: <Dashboard /> },
  { path: "admin/products", element: <ProductList /> },
  { path: "admin/products/:id", element: <ProductDetail /> },
  { path: "admin/products/create", element: <ProductCreate /> },
  { path: "admin/products/:id/edit", element: <ProductEdit /> },
  { path: "admin/orders", element: <OrderManagement /> },
  { path: "admin/audit-logs", element: <AuditLogs /> },
  { path: "admin/reviews", element: <AdminReviews /> },
];

// Route khu vực bán hàng — cần STAFF. Chỉ có POS đợt này (Quản lý đơn hàng của STAFF hoãn
// tới khi authen/author hoàn thiện — xem plan).
const staffRoutes = [{ path: "staff/pos", element: <POS /> }];

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      homeRoute,
      ...guestRoutes,
      ...authRoutes,
      ...publicRoutes,
      {
        element: <ProtectedRoute roles={["CUSTOMER"]} />,
        children: customerRoutes,
      },
    ],
  },
  {
    element: <ProtectedRoute roles={["ADMIN"]} />,
    children: [
      {
        path: "/",
        element: <AdminLayout />,
        children: adminRoutes,
      },
    ],
  },
  {
    element: <ProtectedRoute roles={["STAFF"]} />,
    children: [
      {
        path: "/",
        element: <StaffLayout />,
        children: staffRoutes,
      },
    ],
  },
]);
