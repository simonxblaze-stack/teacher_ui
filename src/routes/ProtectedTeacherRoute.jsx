import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedTeacherRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = "https://www.shikshacom.com/login";
    }
  }, [loading, isAuthenticated]);

  if (loading) return null;
  if (!isAuthenticated) return null;

  return children;
}