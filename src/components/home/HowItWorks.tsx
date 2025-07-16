
import React from "react";
import { UserPlus, Users, Trophy, Award, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlurCard from "@/components/ui/blur-card";

const HowItWorks = () => {
  const steps = [
    {
      icon: <UserPlus className="h-6 w-6 text-esports-purple" />,
      title: "Create Your Account",
      description: "Sign up for free and create your player profile with your gaming credentials and experiences.",
      delay: "0s",
    },
    {
      icon: <Users className="h-6 w-6 text-esports-blue" />,
      title: "Form Your Team",
      description: "Create a team or join an existing one to collaborate with other players for tournaments.",
      delay: "0.1s",
    },
    {
      icon: <Trophy className="h-6 w-6 text-esports-cyan" />,
      title: "Join Tournaments",
      description: "Browse through available tournaments, register your team, and prepare for the competition.",
      delay: "0.2s",
    },
    {
      icon: <Award className="h-6 w-6 text-primary" />,
      title: "Win Prizes",
      description: "Compete against other teams, climb the rankings, and win prestigious awards and prize pools.",
      delay: "0.3s",
    },
  ];

  return (
    <section className="py-20 bg-esports-gray/30">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground">
            Getting started with EsportsMaster is simple. Follow these steps to begin your journey in competitive gaming.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <BlurCard 
              key={index} 
              className="flex flex-col items-center text-center p-8 animate-fade-up"
              style={{ animationDelay: step.delay }}
            >
              <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">
                {step.description}
              </p>
              <div className="mt-6 flex justify-center items-center">
                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block w-12 h-0.5 bg-muted/30 ml-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-esports-purple to-esports-blue animate-shimmer"></div>
                  </div>
                )}
              </div>
            </BlurCard>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-gradient-to-r from-esports-purple to-esports-blue hover:opacity-90 transition-opacity">
            Get Started Now <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
