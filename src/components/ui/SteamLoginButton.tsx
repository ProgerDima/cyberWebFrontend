import React from "react";

const STEAM_LOGIN_URL = "https://90dad6d1631e.ngrok-free.app/auth/steam";

export const SteamLoginButton: React.FC = () => (
  <button
    onClick={() => (window.location.href = STEAM_LOGIN_URL)}
    className="bg-[#171a21] text-white px-6 py-2 rounded flex items-center justify-center gap-2 mt-4 w-full hover:bg-[#1b2838] transition-colors"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.62 20.565 6.363 24.68 11.979 24.68c6.649 0 12.021-5.373 12.021-12.021C24 5.372 18.628.001 11.979.001zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.456-.397.957-1.497 1.41-2.455 1.011z"/>
    </svg>
    Увійти через Steam
  </button>
);