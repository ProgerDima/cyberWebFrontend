import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/home/HeroSection";
import FeaturedTournaments from "@/components/home/FeaturedTournaments";
import HowItWorks from "@/components/home/HowItWorks";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Перенаправлення на логін, якщо користувач не авторизований
    }
  }, [navigate]);

  return (
    <div className="page-transition-wrapper">
      <HeroSection />
      <FeaturedTournaments />
      <HowItWorks />
    </div>
  );
};

export default Index;
