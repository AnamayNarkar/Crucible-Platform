import React, { useEffect, useState} from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { verifySession } from "../services/api/auth";

interface ProtectedRouteProps {
  element: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await verifySession();
        setIsVerified(true);
        setIsLoading(false);
      } catch (error) {
        setIsVerified(false);
        setIsLoading(false);
        navigate("/auth");
      }
    };

    checkSession();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return isVerified ? element : null;
};

export default ProtectedRoute;
