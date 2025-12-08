import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const AuthProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    return <Navigate to="/" />;
  } else {
    return <>{children}</>;
  }
};

export default AuthProtectedRoute;
