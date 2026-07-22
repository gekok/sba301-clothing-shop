import Login from './pages/Login';
import Register from './pages/Register';
import Verify_Email from './pages/Verify_Email';
import ForgotPassword from './pages/ForgotPassword';
import Verify_ForgotPassword from './pages/Verify_ForgotPassword';
import ResetPassword from './pages/ResetPassword';

export const authRoutes = [
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path:"/verify-email",
        element: <Verify_Email />
    },
    {
        path:"/forgot-password",
        element: <ForgotPassword />
    },
    {
        path:'/verify-forgot-password',
        element: <Verify_ForgotPassword />
    },
    {
        path: '/reset-password',
        element: <ResetPassword />
    }
]