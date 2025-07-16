import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { SteamLoginButton } from "@/components/ui/SteamLoginButton";

export default function AuthForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("register") === "1") {
      setIsLogin(false);
    } else {
      setIsLogin(true); // ДОДАЙ ЦЕ
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const endpoint = isLogin ? "login" : "register";
    try {
      const response = await fetch(`http://localhost:3000/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("username", username);
          if (data.role) localStorage.setItem("role", data.role);
          window.location.href = "/";
        } else {
          console.log("Registration successful:", data);
          setIsLogin(true);
        }
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (error) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-esports-gray">
      <Card className="w-96 shadow-lg p-6">
        <CardHeader>
          <CardTitle className="text-center">
            {isLogin ? "Login" : "Register"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              {isLogin ? "Login" : "Register"}
            </Button>
          </form>
          <p className="text-center text-sm mt-2">
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              className="text-blue-500"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
          <div className="mt-4">
            <SteamLoginButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
