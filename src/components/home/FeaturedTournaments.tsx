
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import TournamentCard from "@/components/tournaments/TournamentCard";
import { Link } from "react-router-dom";

const FeaturedTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Завантажуємо реальні турніри з бекенду
    fetch("http://localhost:3000/tournaments")
      .then(res => res.json())
      .then(data => {
        // Беремо тільки перші 3 турніри
        setTournaments(data.slice(0, 3));
        setLoading(false);
      })
      .catch(err => {
        console.error("Помилка завантаження турнірів:", err);
        setLoading(false);
      });
  }, []);

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
          {loading ? (
            // Показуємо скелетони під час завантаження
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-card/30 backdrop-blur-md border border-border rounded-lg p-6 animate-pulse">
                <div className="h-48 bg-muted rounded-lg mb-4"></div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-4 w-3/4"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            ))
          ) : tournaments.length > 0 ? (
            tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Наразі немає доступних турнірів</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTournaments;
