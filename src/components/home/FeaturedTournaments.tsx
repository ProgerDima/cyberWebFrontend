
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import TournamentCard from "@/components/tournaments/TournamentCard";
import { Link } from "react-router-dom";

const tournamentData = [
  {
    id: "1",
    title: "Champions League 2023",
    game: "League of Legends",
    status: "Registration Open",
    prizePool: "$50,000",
    teams: 32,
    startDate: "Oct 15, 2023",
    bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "FPS Masters",
    game: "Counter-Strike 2",
    status: "Upcoming",
    prizePool: "$25,000",
    teams: 16,
    startDate: "Nov 5, 2023",
    bannerUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Battle Royale Cup",
    game: "Fortnite",
    status: "Registration Open",
    prizePool: "$30,000",
    teams: 50,
    startDate: "Oct 28, 2023",
    bannerUrl: "https://images.unsplash.com/photo-1560253023-3ec5d502b22f?q=80&w=2070&auto=format&fit=crop",
  },
];

const FeaturedTournaments = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Featured Tournaments</h2>
            <p className="text-muted-foreground max-w-2xl">
              Discover ongoing and upcoming tournaments across various games. Register your team and compete for glory.
            </p>
          </div>
          <Link to="/tournaments" className="mt-4 md:mt-0">
            <Button variant="outline" className="group">
              View All 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournamentData.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTournaments;
