import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Trophy, Users, Settings, BarChart2, ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";

const API_URL = "http://localhost:3000/admin"; // Адмінський бекенд

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tournaments");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tournamentData, setTournamentData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch(`${API_URL}/tournaments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setTournamentData(Array.isArray(data) ? data : []);
      } catch (error) {
        setTournamentData([]);
        console.error("Error fetching tournaments:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setUserData(Array.isArray(data) ? data : []);
      } catch (error) {
        setUserData([]);
        console.error("Error fetching users:", error);
      }
    };

    const fetchTeams = async () => {
      try {
        const response = await fetch(`${API_URL}/teams`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setTeamData(Array.isArray(data) ? data : []);
      } catch (error) {
        setTeamData([]);
        console.error("Error fetching teams:", error);
      }
    };

    fetchTournaments();
    fetchUsers();
    fetchTeams();
  }, []);

  const filteredTournaments = tournamentData.filter((tournament) => {
    const matchesSearch = tournament.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || tournament.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = userData.filter((user) => {
    const matchesSearch = user.username
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRole = statusFilter === "all" || user.role === statusFilter;
    return matchesSearch && matchesRole;
  });

  const filteredTeams = teamData.filter((team) => {
    const matchesSearch = team.teamName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>;
      case "completed":
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500 hover:bg-red-600">{role}</Badge>;
      case "moderator":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{role}</Badge>;
      case "user":
        return <Badge className="bg-blue-500 hover:bg-blue-600">{role}</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  // Блокування користувача
  const handleBlockUser = async (userId) => {
    try {
      await fetch(`${API_URL}/users/${userId}/block`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setShowBlockModal(false);
      // Оновити список користувачів
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      alert("Помилка блокування користувача");
    }
  };

  return (
    <div className="page-transition-wrapper min-h-screen">
      <div className="bg-esports-gray py-20 pt-40">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center">
                <Settings className="h-7 w-7 mr-3 text-esports-blue" />
                Admin Panel
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Manage tournaments, users, teams, and settings for the EsportsMaster platform.
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button
                variant={activeTab === "tournaments" ? "default" : "outline"}
                className={activeTab === "tournaments" ? "bg-gradient-to-r from-esports-purple to-esports-blue" : ""}
                onClick={() => setActiveTab("tournaments")}
              >
                <Trophy className="mr-2 h-4 w-4" />
                Турніри
              </Button>
              <Button
                variant={activeTab === "users" ? "default" : "outline"}
                className={activeTab === "users" ? "bg-gradient-to-r from-esports-purple to-esports-blue" : ""}
                onClick={() => setActiveTab("users")}
              >
                <Users className="mr-2 h-4 w-4" />
                Користувачі
              </Button>
              <Button
                variant={activeTab === "teams" ? "default" : "outline"}
                className={activeTab === "teams" ? "bg-gradient-to-r from-esports-purple to-esports-blue" : ""}
                onClick={() => setActiveTab("teams")}
              >
                <Users className="mr-2 h-4 w-4" />
                Команди
              </Button>
              <Button
                variant={activeTab === "stats" ? "default" : "outline"}
                className={activeTab === "stats" ? "bg-gradient-to-r from-esports-purple to-esports-blue" : ""}
                onClick={() => setActiveTab("stats")}
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                Статистика
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card/30 backdrop-blur-md border border-border rounded-lg p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={activeTab === "tournaments" ? "Search tournaments..." : "Search users..."}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={activeTab === "tournaments" ? "Status" : "Role"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {activeTab === "tournaments" ? (
                      <>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Add button */}
          <div className="flex justify-end mb-4">
            <Button className="bg-gradient-to-r from-esports-purple to-esports-blue hover:opacity-90 transition-opacity">
              <Plus className="mr-2 h-4 w-4" />
              {activeTab === "tournaments" ? "Add Tournament" : "Add User"}
            </Button>
          </div>

          {/* Tables */}
          {activeTab === "tournaments" && (
            <div className="bg-card/30 backdrop-blur-md border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Discipline</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTournaments.length > 0 ? (
                    filteredTournaments.map((tournament) => (
                      <TableRow key={tournament.id}>
                        <TableCell>{tournament.name}</TableCell>
                        <TableCell>{tournament.discipline}</TableCell>
                        <TableCell>{tournament.created_by}</TableCell>
                        <TableCell>{new Date(tournament.created_at).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No tournaments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {activeTab === "users" && (
            <div className="bg-card/30 backdrop-blur-md border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Tournaments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          {user.tournaments && user.tournaments.length > 0 ? (
                            <ul className="space-y-1">
                              {user.tournaments.map((tournament) => (
                                <li key={tournament.id}>{tournament.name}</li>
                              ))}
                            </ul>
                          ) : (
                            <span>No tournaments</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right flex gap-2 justify-end">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowBlockModal(true);
                            }}
                          >
                            <ShieldOff className="w-4 h-4 mr-1" />
                            Block
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {/* Модалка блокування */}
              {showBlockModal && selectedUser && (
                <Modal onClose={() => setShowBlockModal(false)}>
                  <div className="p-6">
                    <h2 className="text-lg font-bold mb-4">Блокування користувача</h2>
                    <p>Ви впевнені, що хочете заблокувати користувача <b>{selectedUser.username}</b>?</p>
                    <div className="flex gap-4 mt-6">
                      <Button
                        variant="destructive"
                        onClick={() => handleBlockUser(selectedUser.id)}
                      >
                        Так, заблокувати
                      </Button>
                      <Button variant="outline" onClick={() => setShowBlockModal(false)}>
                        Відмінити
                      </Button>
                    </div>
                  </div>
                </Modal>
              )}
            </div>
          )}
          {activeTab === "teams" && (
            <div className="bg-card/30 backdrop-blur-md border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Назва команди</TableHead>
                    <TableHead>Капітан</TableHead>
                    <TableHead>Учасники</TableHead>
                    <TableHead>Створена</TableHead>
                    <TableHead className="text-right">Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeams.length > 0 ? (
                    filteredTeams.map((team) => (
                      <TableRow key={team.teamId}>
                        <TableCell>{team.teamName}</TableCell>
                        <TableCell>
                          {team.members?.find((m) => m.role === "Капітан")?.name || "—"}
                        </TableCell>
                        <TableCell>{team.members?.length || 0}</TableCell>
                        <TableCell>{new Date(team.created_at).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No teams found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {activeTab === "stats" && (
            <div className="bg-card/30 backdrop-blur-md border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Статистика</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-[#23263a] rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold text-esports-blue">{tournamentData.length}</div>
                  <div className="text-[#bfc9e0] mt-2">Всього турнірів</div>
                </div>
                <div className="bg-[#23263a] rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold text-esports-blue">{userData.length}</div>
                  <div className="text-[#bfc9e0] mt-2">Всього користувачів</div>
                </div>
                <div className="bg-[#23263a] rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold text-esports-blue">{teamData.length}</div>
                  <div className="text-[#bfc9e0] mt-2">Всього команд</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
