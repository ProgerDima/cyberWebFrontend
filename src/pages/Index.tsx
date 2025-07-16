import React from "react";
import HeroSection from "@/components/home/HeroSection";
import FeaturedTournaments from "@/components/home/FeaturedTournaments";
import HowItWorks from "@/components/home/HowItWorks";

const Index = () => {
  // Видалили автоматичне перенаправлення - головна сторінка має бути доступна для всіх
  
  return (
    <div className="page-transition-wrapper">
      <HeroSection />
      <FeaturedTournaments />
      <HowItWorks />
    </div>
  );
};

export default Index;
