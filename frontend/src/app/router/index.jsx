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
import { homeRoute } from '../../features/guest/routes';

import ProductList from '../../features/products/pages/ProductList.jsx';
import CartExperience from '../../features/cart/components/CartExperience/CartExperience.jsx';
import CheckoutLayout from '../../features/checkout/components/CheckoutLayout.jsx';
import OrderManagement from '../../features/orders/pages/OrderManagement.jsx';
import Dashboard from '../../features/dashboard/pages/Dashboard.jsx';
import POS from '../../features/pos/pages/POS.jsx';
import AuditLogs from '../../features/audit-logs/pages/AuditLogs.jsx';

const teamFeatureRoutes = [
  { path: 'products', element: <ProductList /> },
  { path: 'products/:id', element: <ProductList /> },
  { path: 'cart', element: <CartExperience /> },
  { path: 'checkout', element: <CheckoutLayout /> },
  { path: 'admin/dashboard', element: <Dashboard /> },
  { path: 'admin/products', element: <ProductList /> },
  { path: 'admin/orders', element: <OrderManagement /> },
  { path: 'admin/audit-logs', element: <AuditLogs /> },
  { path: 'staff/pos', element: <POS /> },
];

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      homeRoute,
      ...authRoutes,
      ...teamFeatureRoutes,
    ],
  },
]);
