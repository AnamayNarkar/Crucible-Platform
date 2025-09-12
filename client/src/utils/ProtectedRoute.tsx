import React, { useEffect, useState} from "react";
import type { ReactElement } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  element: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/auth/verifyUser", {
          withCredentials: true,
        });
        if (response.status >= 200 && response.status < 300) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        const error = err as AxiosError;
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          navigate("/auth");
        } else {
          console.error("Error verifying user:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: "#242424",
          color: "#fff",
          textAlign: "center",
          padding: "20px",
        }}
      />
    );
  }

  return isAuthenticated ? element : null;
};

export default ProtectedRoute;
