import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BlurCard from "@/components/ui/blur-card";

interface Tournament {
  id: string;
  name: string;
  format: string;
  status: string;
  start_date: string;
  teams?: any[];
  max_teams?: number;
  bannerUrl?: string;
  players_per_team?: number; // ДОДАЙ ЦЕЙ РЯДОК
}

interface TournamentCardProps {
  tournament: Tournament;
}

const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
  const navigate = useNavigate();

  return (
    <BlurCard className="overflow-hidden flex flex-col h-full transition-transform hover:translate-y-[-5px] hover:shadow-xl group">
      {/* Якщо є банер, показуй його */}
      {tournament.bannerUrl && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <img
            src={tournament.bannerUrl}
            alt={tournament.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex-1 p-6">
        <h3 className="text-xl font-bold mb-2 text-white">
          {tournament.name}
        </h3>
        <div className="text-gray-300 mb-2">
          Формат: <span className="font-semibold">{tournament.format || "--"}</span>
        </div>
        <div className="text-gray-300 mb-2">
          Команд: <span className="font-semibold">
            {Array.isArray(tournament.teams) ? tournament.teams.length : 0}
            {tournament.max_teams ? ` / ${tournament.max_teams}` : ""}
          </span>
        </div>
        <div className="text-gray-300 mb-2">
          Гравців у команді: <span className="font-semibold">
            {tournament.players_per_team ?? "--"}
          </span>
        </div>
        <div className="text-gray-300 mb-2">
          Початок: <span className="font-semibold">
            {tournament.start_date
              ? new Date(tournament.start_date).toLocaleString("uk-UA", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                  timeZone: "Europe/Kyiv"
                })
              : "--"}
          </span>
        </div>
      </div>
      <div className="px-6 pb-6 mt-auto">
        <Button
          className="w-full bg-gradient-to-r from-esports-purple to-esports-blue hover:opacity-90 transition-opacity"
          onClick={() => navigate(`/tournaments/${tournament.id}`)}
        >
          View Details
        </Button>
      </div>
    </BlurCard>
  );
};

export default TournamentCard;
