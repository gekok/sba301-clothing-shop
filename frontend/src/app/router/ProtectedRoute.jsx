
import { Navigate, Outlet } from "react-router-dom";
import {useAuth} from '../../app/provider/AuthProvider';

export default function ProtectedRoute({ roles }) {
  const { user,loading } = useAuth();
  if(loading){
    return <div>Loading....</div>
  }
  // Chưa đăng nhập
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Không đủ quyền
  if (roles && !roles.includes(user.roles)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}