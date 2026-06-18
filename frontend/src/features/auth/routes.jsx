import Login from './pages/Login';
import Register from './pages/Register';
export const authRoutes = [
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    }
]