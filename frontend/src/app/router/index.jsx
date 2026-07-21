// import {createBrowserRouter} from "react-router-dom";
// import PublicLayout from "../layout/PublicLayout";
// import { authRoutes } from "../../features/auth/routes";
// export const router = createBrowserRouter([
//     {
//         element: <PublicLayout />,
//         children: [
//             ...authRoutes,
//         ]
//     }
// ]);

import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layout/MainLayout.jsx';
import { authRoutes } from '../../features/auth/routes';
import { homeRoute, guestRoutes } from '../../features/guest/routes';
import { reviewRoutes } from '../../features/reviews/routes.jsx';

import ProductList from '../../features/products/pages/ProductList.jsx';
import CartExperience from '../../features/cart/components/CartExperience/CartExperience.jsx';
import CheckoutLayout from '../../features/checkout/components/CheckoutLayout.jsx';
import OrderManagement from '../../features/orders/pages/OrderManagement.jsx';
import Dashboard from '../../features/dashboard/pages/Dashboard.jsx';
import POS from '../../features/pos/pages/POS.jsx';
import AuditLogs from '../../features/audit-logs/pages/AuditLogs.jsx';
import ProductCreate from '../../features/products/pages/ProductCreate.jsx';
import ProductEdit from '../../features/products/pages/ProductEdit.jsx';
import ProductDetail from '../../features/products/pages/ProductDetail';
import CustomerProductDetail from '../../features/products/pages/CustomerProductDetail.jsx';
import MyOrders from '../../features/orders/pages/MyOrders.jsx';
import VNPayReturn from '../../features/checkout/components/VNPayReturn.jsx';

const teamFeatureRoutes = [
  { path: 'products', element: <ProductList /> },

  { path: 'products/create', element: <ProductCreate /> },

  { path: 'products/:id', element: <CustomerProductDetail /> },
  { path: 'cart', element: <CartExperience /> },
  { path: 'checkout', element: <CheckoutLayout /> },
  { path: 'checkout/vnpay-return', element: <VNPayReturn /> },
  { path: 'my-orders', element: <MyOrders /> },
  { path: 'admin/dashboard', element: <Dashboard /> },
  { path: 'admin/products', element: <ProductList /> },

  {
    path:"admin/products/:id",
    element:<ProductDetail/>
  },

  {
    path: 'admin/products/create',
    element: <ProductCreate />
  },

  {
    path: 'admin/products/:id/edit',
    element: <ProductEdit />
  },

  { path: 'admin/orders', element: <OrderManagement /> },
  { path: 'admin/audit-logs', element: <AuditLogs /> },
  { path: 'staff/pos', element: <POS /> },
  ...reviewRoutes,
];

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      homeRoute,
      ...guestRoutes,
      ...authRoutes,
      ...teamFeatureRoutes,
    ],
  },
]);
