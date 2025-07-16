import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateTournamentModal from "@/components/tournaments/CreateTournamentModal";
import TournamentCard from "@/components/tournaments/TournamentCard";
import { Trophy, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:3000/tournaments")
      .then(res => res.json())
      .then(data => {
        setTournaments(data);
        setLoading(false);
      });
  }, []);

  // Фільтрація
  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = t.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      t.status?.toLowerCase() === statusFilter ||
      (statusFilter === "upcoming" && t.status?.toLowerCase() === "запланований");
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-transition-wrapper min-h-screen">
      <div className="bg-esports-gray py-20 pt-40">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center">
                <Trophy className="h-7 w-7 mr-3 text-esports-purple" />
                Турніри
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Переглянь всі заплановані турніри, знаходь цікаві події та приєднуйся до змагань!
              </p>
            </div>
            {token ? (
              <Button
                className="mt-4 md:mt-0 bg-gradient-to-r from-esports-purple to-esports-blue hover:opacity-90 transition-opacity"
                onClick={() => setShowCreateModal(true)}
              >
                Створити турнір
              </Button>
            ) : (
              <p className="text-red-500 mt-2 text-sm">
                Щоб створити турнір, потрібно авторизуватись.
              </p>
            )}
          </div>

          {/* Filters */}
          <div className="bg-card/30 backdrop-blur-md border border-border rounded-lg p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Пошук турнірів..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Статус" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всі статуси</SelectItem>
                  <SelectItem value="upcoming">Заплановані</SelectItem>
                  <SelectItem value="registration open">Відкрита реєстрація</SelectItem>
                  <SelectItem value="finished">Завершені</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Показано {filteredTournaments.length}{" "}
              {filteredTournaments.length === 1 ? "турнір" : "турнірів"}
            </p>
          </div>

          {/* Tournament cards */}
          {loading ? (
            <div className="text-center py-20">Завантаження...</div>
          ) : filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold mb-2">Немає турнірів</h3>
              <p className="text-muted-foreground">Спробуйте змінити фільтри або пошук.</p>
            </div>
          )}
        </div>
      </div>
      {showCreateModal && (
        <CreateTournamentModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(id) => {
            setShowCreateModal(false);
            navigate(`/tournaments/${id}`);
          }}
        />
      )}
    </div>
  );
};

export default Tournaments;
