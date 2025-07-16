import React from "react";

const STEAM_LOGIN_URL = "http://localhost:3000/auth/steam";

export const SteamLoginButton: React.FC = () => (
  <button
    onClick={() => (window.location.href = STEAM_LOGIN_URL)}
    className="bg-[#171a21] text-white px-6 py-2 rounded flex items-center gap-2 mt-4"
  >
    <img src="/steam-logo.png" alt="Steam" className="w-6 h-6" />
    Увійти через Steam
  </button>
);