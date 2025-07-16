
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Trophy, Users, Award } from "lucide-react";
import BlurCard from "@/components/ui/blur-card";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-hero-pattern opacity-60" />
      <div className="absolute top-20 -left-56 w-96 h-96 bg-esports-purple/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-10 -right-56 w-96 h-96 bg-esports-blue/20 rounded-full blur-[100px]" />

      <div className="container relative mx-auto px-6">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-muted/50 border border-muted text-sm font-medium animate-fade-in">
            Elevate Your Gaming Career
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight animate-fade-up">
            Compete in
            <span className="gradient-text"> Professional Esports </span>
            Tournaments
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Join the ultimate platform where gamers become legends. Create teams, participate in tournaments, and win prestigious prizes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Button size="lg" className="bg-gradient-to-r from-esports-purple to-esports-blue hover:opacity-90 transition-opacity">
              Create Account <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Browse Tournaments
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <BlurCard className="flex flex-col items-center text-center p-8" glowEffect="sm">
            <div className="w-12 h-12 rounded-full bg-esports-purple/20 flex items-center justify-center mb-4">
              <Trophy className="h-5 w-5 text-esports-purple" />
            </div>
            <h3 className="text-xl font-bold mb-2">Epic Tournaments</h3>
            <p className="text-muted-foreground text-sm">
              Participate in professionally organized tournaments across various games with substantial prize pools.
            </p>
          </BlurCard>
          
          <BlurCard className="flex flex-col items-center text-center p-8" glowEffect="sm">
            <div className="w-12 h-12 rounded-full bg-esports-blue/20 flex items-center justify-center mb-4">
              <Users className="h-5 w-5 text-esports-blue" />
            </div>
            <h3 className="text-xl font-bold mb-2">Team Building</h3>
            <p className="text-muted-foreground text-sm">
              Create your dream team, recruit talented players, and climb the ranks together to dominate the competition.
            </p>
          </BlurCard>
          
          <BlurCard className="flex flex-col items-center text-center p-8" glowEffect="sm">
            <div className="w-12 h-12 rounded-full bg-esports-cyan/20 flex items-center justify-center mb-4">
              <Award className="h-5 w-5 text-esports-cyan" />
            </div>
            <h3 className="text-xl font-bold mb-2">Rewards & Recognition</h3>
            <p className="text-muted-foreground text-sm">
              Win prizes, gain recognition, and build your reputation as one of the top players in the competitive scene.
            </p>
          </BlurCard>
        </div>
        
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      </div>
    </section>
  );
};

export default HeroSection;
