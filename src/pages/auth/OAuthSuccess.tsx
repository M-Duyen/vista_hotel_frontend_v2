import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleOAuthSuccess } from "../../services/authService";

const OAuthSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const refreshToken = params.get("refreshToken");
    const rawUser = params.get("user");
    const userJson = rawUser ? decodeURIComponent(rawUser) : null;

    if (token && userJson) {
      handleOAuthSuccess(token, userJson, refreshToken || undefined);
      navigate("/");
    } else {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <p>Đang đăng nhập qua Google/Facebook...</p>;
};

export default OAuthSuccess;
