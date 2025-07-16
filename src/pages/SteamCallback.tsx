import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SteamCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const accessToken = params.get("accessToken"); // якщо бекенд повертає окремо
    const username = params.get("username"); // додай username у редірект з бекенду
    const refreshToken = params.get("refreshToken");
    const role = params.get("role"); // <-- додати
    if (token || accessToken) {
      if (token) localStorage.setItem("token", token);
      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      if (username) localStorage.setItem("username", username);
      if (role) localStorage.setItem("role", role);
      window.location.href = "/"; // повне оновлення, щоб Navbar і інші компоненти побачили зміни
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <div>Авторизація через Steam...</div>;
}