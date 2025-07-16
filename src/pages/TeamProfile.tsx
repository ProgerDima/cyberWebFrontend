import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

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

const TeamProfile = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState<any>(null);
  const [inviteInput, setInviteInput] = useState("");
  const [userSuggestions, setUserSuggestions] = useState<any[]>([]);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [tab, setTab] = useState<"overview" | "members" | "statistics" | "settings">("members");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamTournaments, setTeamTournaments] = useState<any[]>([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(true);

  // ОКРЕМА ФУНКЦІЯ ДЛЯ ЗАВАНТАЖЕННЯ ПРОФІЛЮ
  const fetchTeamProfile = () => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:3000/teams/${teamId}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setTeam(data));
  };

  useEffect(() => {
    fetchTeamProfile();
  }, [teamId]);

  // Автодоповнення користувачів
  useEffect(() => {
    if (inviteInput.length < 1) {
      setUserSuggestions([]);
      return;
    }
    const token = localStorage.getItem("token");
    fetch(`http://localhost:3000/users/search?query=${inviteInput}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUserSuggestions(data));
  }, [inviteInput]);

  // Запросити користувача
  const handleInvite = async (userId: number) => {
    setInviteStatus(null);
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3000/teams/${teamId}/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ toUserId: userId })
    });
    if (res.ok) {
      setInviteStatus("Запрошення надіслано!");
      setInviteInput("");
      setUserSuggestions([]);
      // Оновити дані команди (щоб після прийняття інвайту новий учасник зʼявився)
      fetchTeamProfile();
    } else {
      const data = await res.json();
      setInviteStatus(data.error || "Помилка запрошення");
    }
  };

  const handleJoinTeam = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3000/teams/${team.teamId}/join`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (res.ok) {
      fetchTeamProfile(); // Оновити дані команди
    }
  };

  const handleLeaveTeam = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3000/teams/${team.teamId}/leave`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (res.ok) {
      fetchTeamProfile(); // Оновити дані команди
    }
  };

  const handleDeleteTeam = async () => {
    const token = localStorage.getItem("token");
    if (!team) return;
    const res = await fetch(`http://localhost:3000/teams/${team.teamId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (res.ok) {
      window.location.href = "/teams";
    }
  };

  const myId = getUserIdFromToken();
  const isCaptain = team && Array.isArray(team.members) && team.members.some((m: any) => m.id === myId && m.role === "Капітан");
  const isMember = team && Array.isArray(team.members) && team.members.some((m: any) => m.id === myId);

  useEffect(() => {
    if (!teamId) return;
    setTournamentsLoading(true);
    const token = localStorage.getItem("token");
    fetch(`http://localhost:3000/tournaments/teams/${teamId}/tournaments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTeamTournaments(data))
      .catch(() => setTeamTournaments([]))
      .finally(() => setTournamentsLoading(false));
  }, [teamId]);

  if (!team) {
    return <div className="text-white text-center py-10">Loading...</div>;
  }

  // Тільки після перевірки team!
  const isFullForAnyTournament = teamTournaments.some(
    t => Number.isFinite(t.players_per_team) && team.members.length >= t.players_per_team
  );

  return (
    <div className="min-h-screen bg-[#10131c]">
      {/* Header */}
      <div className="container mx-auto pt-40 pb-4">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 rounded-full bg-[#23263a] flex items-center justify-center">
            <span className="text-6xl text-[#6c7a96]">👥</span>
          </div>
          <div>
            <div className="uppercase text-[#bfc9e0] text-xs font-semibold mb-1">TEAM</div>
            <div className="text-4xl font-extrabold text-white mb-1 tracking-wide">{team.teamName}</div>
            <div className="text-[#bfc9e0] text-sm">{team.members.length} member</div>
          </div>
          {isCaptain && !isFullForAnyTournament && (
            <button
              className="ml-auto bg-[#13b7e6] hover:bg-[#0fa1c7] text-white px-6 py-2 rounded font-bold transition"
              onClick={() => setShowInviteModal(true)}
            >
              Invite
            </button>
          )}
          {!team.is_private && !isMember && !isFullForAnyTournament && (
            <button
              className="ml-auto bg-[#13b7e6] hover:bg-[#0fa1c7] text-white px-6 py-2 rounded font-bold transition"
              onClick={handleJoinTeam}
            >
              Приєднатися до команди
            </button>
          )}
          {isMember && !isCaptain && (
            <button
              className="ml-auto bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold transition"
              onClick={handleLeaveTeam}
            >
              Вийти з команди
            </button>
          )}
        </div>
      </div>

      {/* ДОДАЙ МОДАЛЬНЕ ВІКНО ОДРАЗУ ПІСЛЯ HEADER */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#23263a] rounded-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-white text-xl"
              onClick={() => setShowInviteModal(false)}
            >×</button>
            <div className="text-white font-semibold mb-1">Запросити у команду</div>
            <input
              className="w-full p-2 rounded bg-[#181a23] text-white mb-1 border border-gray-700"
              placeholder="Введіть ім'я користувача"
              value={inviteInput}
              onChange={e => setInviteInput(e.target.value)}
            />
            {userSuggestions.length > 0 && (
              <div className="bg-[#23263a] rounded shadow-lg mt-1 max-h-40 overflow-y-auto">
                {userSuggestions.map(user => (
                  <div
                    key={user.id}
                    className="px-4 py-2 cursor-pointer hover:bg-[#13b7e6] hover:text-white transition"
                    onClick={() => handleInvite(user.id)}
                  >
                    {user.username}
                  </div>
                ))}
              </div>
            )}
            <button
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => {
                if (userSuggestions.length > 0) handleInvite(userSuggestions[0].id);
              }}
              disabled={userSuggestions.length === 0}
            >
              Запросити
            </button>
            {inviteStatus && <div className="text-green-400 mt-2">{inviteStatus}</div>}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="container mx-auto">
        <div className="flex gap-8 border-b border-[#23263a] mb-2 pl-2">
          <button
            className={`pb-2 font-semibold text-base transition ${
              tab === "overview"
                ? "border-b-2 border-blue-400 text-white"
                : "text-[#bfc9e0] hover:text-white"
            }`}
            onClick={() => setTab("overview")}
          >
            Overview
          </button>
          <button
            className={`pb-2 font-semibold text-base transition ${
              tab === "members"
                ? "border-b-2 border-blue-400 text-white"
                : "text-[#bfc9e0] hover:text-white"
            }`}
            onClick={() => setTab("members")}
          >
            Members
          </button>
          <button
            className={`pb-2 font-semibold text-base transition ${
              tab === "statistics"
                ? "border-b-2 border-blue-400 text-white"
                : "text-[#bfc9e0] hover:text-white"
            }`}
            onClick={() => setTab("statistics")}
          >
            Statistics
          </button>
          {isCaptain && (
            <button
              className={`pb-2 font-semibold text-base transition ${
                tab === "settings"
                  ? "border-b-2 border-red-400 text-white"
                  : "text-[#bfc9e0] hover:text-white"
              }`}
              onClick={() => setTab("settings")}
            >
              Settings
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto">
        {tab === "members" && (
          <div>
            {/* Invite block тільки для капітана */}
            {isCaptain && (
              <>
                <div className="bg-[#292c3c] rounded-lg p-5 mb-6">
                  <div className="text-white font-semibold mb-1">Invite</div>
                  <div className="text-[#bfc9e0] text-sm">Invite new members to the team.</div>
                </div>
                {/* Модалка інвайту */}
                {showInviteModal && (
                  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[#23263a] rounded-lg p-6 w-full max-w-md relative">
                      <button
                        className="absolute top-2 right-2 text-white text-xl"
                        onClick={() => setShowInviteModal(false)}
                      >×</button>
                      <div className="text-white font-semibold mb-1">Запросити у команду</div>
                      <input
                        className="w-full p-2 rounded bg-[#181a23] text-white mb-1 border border-gray-700"
                        placeholder="Введіть ім'я користувача"
                        value={inviteInput}
                        onChange={e => setInviteInput(e.target.value)}
                      />
                      {userSuggestions.length > 0 && (
                        <div className="bg-[#23263a] rounded shadow-lg mt-1 max-h-40 overflow-y-auto">
                          {userSuggestions.map(user => (
                            <div
                              key={user.id}
                              className="px-4 py-2 cursor-pointer hover:bg-[#13b7e6] hover:text-white transition"
                              onClick={() => handleInvite(user.id)}
                            >
                              {user.username}
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={() => {
                          if (userSuggestions.length > 0) handleInvite(userSuggestions[0].id);
                        }}
                        disabled={userSuggestions.length === 0}
                      >
                        Запросити
                      </button>
                      {inviteStatus && <div className="text-green-400 mt-2">{inviteStatus}</div>}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Members list */}
            <div className="flex flex-wrap gap-6">
              {team.members.map((member) => (
                <Link
                  to={`/profile/${member.id}`}
                  key={member.id}
                  className="flex items-center gap-4 bg-[#23263a] rounded-lg p-4 min-w-[220px] hover:bg-[#2d3250] transition"
                  style={{ textDecoration: "none" }}
                >
                  <div className="w-16 h-16 rounded-full bg-[#181a23] flex items-center justify-center">
                    <span className="text-3xl text-[#6c7a96]">👤</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold flex items-center gap-2">
                      {member.name}
                      {member.role === "Капітан" && (
                        <span className="ml-2 px-2 py-1 bg-[#23263a] rounded text-xs text-[#13b7e6]">Captain</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {tab === "overview" && (
          <div className="flex flex-col md:flex-row gap-8 py-10">
            {/* Activities */}
            <div className="flex-1 bg-transparent">
              <h2 className="text-white text-xl font-bold mb-6">Activities</h2>
              <div className="flex flex-col gap-3">
                {tournamentsLoading ? (
                  <div className="text-[#bfc9e0]">Завантаження...</div>
                ) : teamTournaments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 bg-[#181c2f] rounded-lg">
                    <span className="text-4xl text-[#6c7a96] mb-2">🔥</span>
                    <div className="text-[#bfc9e0] font-semibold mb-1">No activities</div>
                    <div className="text-[#bfc9e0] text-sm">This team has not played anything yet.</div>
                  </div>
                ) : (
                  <ul>
                    {teamTournaments.map(tournament => (
                      <li key={tournament.id} className="bg-[#181c2f] rounded-lg p-4 mb-2">
                        <div className="text-white font-bold text-lg">{tournament.name}</div>
                        <div className="text-[#bfc9e0] text-sm">
                          {tournament.status} &middot; {new Date(tournament.start_date).toLocaleDateString("uk-UA")}
                        </div>
                        <div className="mt-1">
                          <Link to={`/tournaments/${tournament.id}`} className="text-[#13b7e6] hover:underline">
                            Перейти до турніру
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {/* About */}
            <div className="w-full md:w-96">
              <h2 className="text-white text-xl font-bold mb-4">About</h2>
              <div className="bg-[#23263a] rounded-lg p-6">
                <div className="text-white text-lg font-bold mb-2">About team</div>
                <div className="text-[#bfc9e0] text-sm">
                  {/* Тут можна підставити реальний опис з бекенду */}
                  This is a team page. Here you can add a description about your team, its goals, achievements, or any other information.
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "statistics" && (
          <div className="text-[#bfc9e0] text-lg py-10">No statistics yet.</div>
        )}

        {tab === "settings" && isCaptain && (
          <div className="py-10">
            <h2 className="text-white text-xl font-bold mb-6">Налаштування команди</h2>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold transition"
              onClick={() => setShowDeleteModal(true)}
            >
              Видалити команду
            </button>
          </div>
        )}
      </div>

      {/* Модалка підтвердження видалення */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#23263a] rounded-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-white text-xl"
              onClick={() => setShowDeleteModal(false)}
            >×</button>
            <div className="text-white font-semibold mb-4">Ви дійсно хочете видалити команду?</div>
            <div className="flex gap-4">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={async () => {
                  await handleDeleteTeam();
                  setShowDeleteModal(false);
                }}
              >
                Підтвердити
              </button>
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded"
                onClick={() => setShowDeleteModal(false)}
              >
                Відхилити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamProfile;