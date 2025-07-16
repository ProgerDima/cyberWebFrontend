import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

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

const Profile = () => {
  const { id } = useParams();
  const myId = String(getUserIdFromToken());
  const isMyProfile = !id || id === myId;
  const userId = id || myId;

  const [tab, setTab] = useState<"teams" | "tournaments" | "friends">("teams");
  const [teams, setTeams] = useState<any[]>([]);
  const [createdTournaments, setCreatedTournaments] = useState<any[]>([]);
  const [joinedTournaments, setJoinedTournaments] = useState<any[]>([]);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    // Завантажити дані користувача
    fetch(`http://localhost:3000/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUsername(data.username);
        setTeams([...(data.createdTeams || []), ...(data.joinedTeams || [])]);
        setCreatedTournaments(data.createdTournaments || []);
        setJoinedTournaments(data.joinedTournaments || []);
      });
  }, [userId]);

  const createdTeams = teams.filter(team => team.is_captain);
  const joinedTeams = teams.filter(team => !team.is_captain);

  return (
    <div className="min-h-screen bg-[#181c2f] py-20 pt-40">
      <div className="container mx-auto px-6 flex flex-col items-center">
        {/* Аватар і заголовок */}
        <div className="w-40 h-40 rounded-full bg-gray-700 flex items-center justify-center mb-4 relative">
          <span className="text-7xl text-gray-400">👤</span>
          {isMyProfile && (
            <button className="absolute bottom-4 right-4 bg-[#23263a] rounded-full p-2 text-white text-xs">
              <span role="img" aria-label="edit">
                📷
              </span>
            </button>
          )}
        </div>
        <div className="uppercase text-muted-foreground mb-2">USER</div>
        <h2 className="text-4xl font-extrabold mb-2">{username}</h2>
        <div className="flex items-center gap-2 mb-8">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
          <span className="text-muted-foreground">Online</span>
          <span className="mx-2">•</span>
          <span className="text-muted-foreground">Registered 15 days ago</span>
        </div>

        {/* Вкладки */}
        <div className="flex gap-6 mb-8">
          <button
            className={`font-bold text-lg pb-1 border-b-2 transition ${
              tab === "teams"
                ? "border-blue-500 text-white"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
            onClick={() => setTab("teams")}
          >
            Teams
          </button>
          <button
            className={`font-bold text-lg pb-1 border-b-2 transition ${
              tab === "tournaments"
                ? "border-blue-500 text-white"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
            onClick={() => setTab("tournaments")}
          >
            Tournaments
          </button>
          <button
            className={`font-bold text-lg pb-1 border-b-2 transition ${
              tab === "friends"
                ? "border-blue-500 text-white"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
            onClick={() => setTab("friends")}
          >
            Friends
          </button>
        </div>

        {/* Контент вкладок */}
        <div className="w-full flex justify-center">
          {tab === "teams" && (
            <div className="w-full">
              <h3 className="text-white text-lg font-bold mb-2">Створені команди</h3>
              <div className="flex gap-6 flex-wrap mb-8">
                {createdTeams.length === 0 && (
                  <div className="text-white">Ви ще не створили команд.</div>
                )}
                {createdTeams.map((team) => (
                  <Link
                    to={`/teams/${team.id}`}
                    key={team.id}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className="w-32 h-32 rounded-full bg-[#23263a] flex items-center justify-center mb-2 group-hover:bg-[#13b7e6] transition">
                      <span className="text-5xl text-[#6c7a96] group-hover:text-white transition">
                        👥
                      </span>
                    </div>
                    <div className="text-white font-semibold group-hover:text-[#13b7e6] transition">
                      {team.name}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Captain
                    </div>
                  </Link>
                ))}
              </div>
              <h3 className="text-white text-lg font-bold mb-2">Команди, в яких ви учасник</h3>
              <div className="flex gap-6 flex-wrap">
                {joinedTeams.length === 0 && (
                  <div className="text-white">Ви ще не берете участь у командах.</div>
                )}
                {joinedTeams.map((team) => (
                  <Link
                    to={`/teams/${team.id}`}
                    key={team.id}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className="w-32 h-32 rounded-full bg-[#23263a] flex items-center justify-center mb-2 group-hover:bg-[#13b7e6] transition">
                      <span className="text-5xl text-[#6c7a96] group-hover:text-white transition">
                        👥
                      </span>
                    </div>
                    <div className="text-white font-semibold group-hover:text-[#13b7e6] transition">
                      {team.name}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Member
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {tab === "tournaments" && (
            <div className="w-full">
              <h3 className="text-white text-lg font-bold mb-2">Створені турніри</h3>
              <div className="flex gap-6 flex-wrap mb-8">
                {createdTournaments.length === 0 && (
                  <div className="text-white">Ви ще не створили турнірів.</div>
                )}
                {createdTournaments.map((t) => (
                  <Link
                    to={`/tournaments/${t.id}`}
                    key={t.id}
                    className="bg-[#23263a] rounded-lg overflow-hidden w-72 p-4 block hover:bg-[#2d3250] transition"
                  >
                    <div className="text-white font-bold text-lg mb-1">{t.name}</div>
                    <div className="text-muted-foreground text-sm mb-1">Формат: {t.format}</div>
                    <div className="text-muted-foreground text-sm mb-1">
                      Команд: {t.teamsCount ?? t.teams_count ?? 0} / {t.maxTeams ?? t.max_teams ?? 0}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Початок: {t.startDate ? new Date(t.startDate).toLocaleString("uk-UA") : ""}
                    </div>
                  </Link>
                ))}
              </div>
              <h3 className="text-white text-lg font-bold mb-2">Турніри, в яких ви берете участь</h3>
              <div className="flex gap-6 flex-wrap">
                {joinedTournaments.length === 0 && (
                  <div className="text-white">Ви ще не берете участь у турнірах.</div>
                )}
                {joinedTournaments.map((t) => (
                  <Link
                    to={`/tournaments/${t.id}`}
                    key={t.id}
                    className="bg-[#23263a] rounded-lg overflow-hidden w-72 p-4 block hover:bg-[#2d3250] transition"
                  >
                    <div className="text-white font-bold">{t.name}</div>
                    <div className="text-muted-foreground text-sm">{t.format}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {tab === "friends" && (
            <div className="flex flex-col items-center">
              <span className="text-5xl text-[#6c7a96] mb-2">👥</span>
              <div className="text-white font-semibold mb-1">No Friends</div>
              <div className="text-muted-foreground mb-4">
                You have not added any friends.
              </div>
              {isMyProfile && (
                <button className="bg-[#13b7e6] text-white px-6 py-2 rounded font-bold">
                  Add friend
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;