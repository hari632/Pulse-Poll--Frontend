import { Navigate, useLocation } from "react-router-dom";
import { authApi } from "../../services/api";

export function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!authApi.isAuthenticated()) {
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
