import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = localStorage.getItem("token");
  return user ? children : <Navigate to="/login" replace />;
}