import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BlurCard from "@/components/ui/blur-card";


interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
}

interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  game: string;
  wins: number;
  losses: number;
  rank: number;
  members: TeamMember[];
  is_private: boolean; // ДОДАЙ ЦЕЙ РЯДОК
}

interface TeamCardProps {
  team: Team;
}

function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.user_id || null;
  } catch {
    return null;
  }
}

const TeamCard = ({ team, reloadTeams }: TeamCardProps & { reloadTeams?: () => void }) => {
  const [members, setMembers] = useState(team.members);
  const [joined, setJoined] = useState(false);
  const winRate = Math.round((team.wins / (team.wins + team.losses)) * 100) || 0;

  const token = localStorage.getItem("token");
  const myId = getUserIdFromToken();
  const username = localStorage.getItem("username");

  const isCaptain = Array.isArray(members) && members.some((m: any) => m.id === myId && m.role === "Капітан");
  const isMember = Array.isArray(members) && members.some((m: any) => m.id === myId);

  const handleJoin = async () => {
    if (!token) return;
    const res = await fetch(`http://localhost:3000/teams/${team.id}/join`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (res.ok) {
      setMembers([
        ...members,
        { id: myId, name: username, role: "Гравець" }
      ]);
      setJoined(true);
    }
  };

  const handleLeave = async () => {
    if (!token) return;
    const res = await fetch(`http://localhost:3000/teams/${team.id}/leave`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (res.ok) {
      setMembers(members.filter((m: any) => m.id !== myId));
      setJoined(false);
    }
  };

  return (
    <BlurCard className="overflow-hidden flex flex-col h-full transition-transform hover:translate-y-[-5px] hover:shadow-xl">
      <div className="p-6 pb-0 flex justify-between items-start">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mr-4 overflow-hidden">
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
            ) : (
              <Users className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <Link to={`/teams/${team.id}`}>
              <h3 className="text-xl font-bold hover:text-primary transition-colors">
                {team.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">{team.game}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center mb-1">
            <Star className="h-4 w-4 text-esports-purple mr-1" />
            <span className="text-sm font-medium">Rank #{team.rank ?? 1}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="text-green-500">{team.wins}W</span> / <span className="text-red-500">{team.losses}L</span> ({winRate}%)
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h4 className="text-sm font-medium mb-3">Team Members</h4>
        <div className="flex flex-wrap gap-2 mb-6">
          {members.map((member) => (
            <div key={member.id} className="inline-flex items-center bg-muted/30 rounded-full pl-1 pr-3 py-1">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={member.avatarUrl} alt={member.name} />
                <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs">{member.name}</span>
              <span className="text-xs text-muted-foreground ml-1">• {member.role}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="px-6 pb-6 mt-auto">
        {!team.is_private && !isMember && !!token && (
          <Button variant="outline" className="w-full" onClick={handleJoin}>
            Приєднатися
          </Button>
        )}
        {isMember && !isCaptain && !!token && (
          <Button variant="outline" className="w-full bg-red-600 text-white mt-2" onClick={handleLeave}>
            Вийти з команди
          </Button>
        )}
        <Button variant="outline" className="w-full mt-2" asChild>
          <Link to={`/teams/${team.id}`}>View Team Profile</Link>
        </Button>
      </div>
    </BlurCard>
  );
};

export default TeamCard;
