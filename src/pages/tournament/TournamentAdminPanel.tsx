import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { Dialog } from "@headlessui/react"; // або будь-який інший модальний компонент
import { X } from "lucide-react";

interface Team {
  id: string;
  name: string;
  avatar: string;
  discipline?: string;
  members?: {
    id: string;
    name?: string;
    avatarUrl?: string;
    role?: string;
    is_captain?: boolean;
  }[];
  confirmed_players?: number[]; // <-- ДОДАЙ ЦЕЙ РЯДОК
}

interface Tournament {
  id: string;
  name: string;
  status: string;
  bannerUrl: string;
  format: string;
  description: string;
  rules: string;
  players_per_team: number;
  prize_pool?: string;
  start_date: string;
  registration_start?: string;
  registration_end?: string;
  ready_start?: string;
  ready_end?: string;
  teams?: Team[];
  max_teams?: number;
  created_at: string; // ДОДАЙ ЦЕЙ РЯДОК
  created_by: string; // username або id організатора
}

function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Спробуй всі можливі варіанти ключа
    return String(payload.userId || payload.user_id || payload.id || "");
  } catch {
    return "";
  }
}

const TournamentAdminPanel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  // Додаємо userId через токен
  const userId = getUserIdFromToken();

  // Таймер до старту
  const [timeLeft, setTimeLeft] = useState<string>("");

  const username = localStorage.getItem("username");
  // const userId = localStorage.getItem("user_id");

  useEffect(() => {
    // Замініть на свій API-запит
    fetch(`http://localhost:3000/tournaments/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTournament(data);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!tournament || !tournament.start_date) return;
    const interval = setInterval(() => {
      // Час початку турніру
      const start = new Date(tournament.start_date).getTime();
      // Поточний час
      const now = new Date().getTime();
      // Рахуємо від поточного часу до старту
      let diff = Math.max(0, start - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [tournament]);

  // --- Додаємо стани для модального вікна ---
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [captainTeams, setCaptainTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  // --- Додаємо стани для модального вікна виходу з турніру ---
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // --- Стан для команд турніру ---
  const [tournamentTeams, setTournamentTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  // --- Стан для користувачів турніру ---
  const [tournamentUsers, setTournamentUsers] = useState<{ id: string }[]>([]);

  // --- Фетчимо команди капітана при відкритті модалки ---
  const fetchCaptainTeams = async () => {
    setSearch("");
    setSelectedTeam(null);
    setRegisterError(null);
    setRegisterSuccess(null);
    try {
      const token = localStorage.getItem("token");
      // Додаємо tournamentId у query
      const res = await fetch(`http://localhost:3000/teams/captain?tournamentId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCaptainTeams(data);
    } catch {
      setCaptainTeams([]);
    }
  };

  // --- Фетчимо команди турніру ---
  useEffect(() => {
    if (!id) return;
    setTeamsLoading(true);
    fetch(`http://localhost:3000/tournaments/${id}/teams`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setTournamentTeams(data);
        setTeamsLoading(false);
      })
      .catch(() => setTeamsLoading(false));
  }, [id, showJoinModal, registerSuccess]); // оновлювати після реєстрації

  // --- Фетчимо користувачів турніру ---
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3000/tournaments/${id}/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setTournamentUsers(data))
      .catch(() => setTournamentUsers([]));
  }, [id, showJoinModal, registerSuccess]);

  // --- Фільтрація команд по пошуку ---
  const filteredTeams = captainTeams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase())
  );

  // --- Обробка реєстрації ---
  const handleRegister = async () => {
    if (!selectedTeam) return;
    setRegistering(true);
    setRegisterError(null);
    setRegisterSuccess(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/tournaments/${id}/add-team`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ teamId: selectedTeam.id }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.error || "Помилка реєстрації");
      } else {
        setRegisterSuccess("Команду зареєстровано!");
        setTimeout(() => setShowJoinModal(false), 0);
      }
    } catch {
      setRegisterError("Помилка мережі");
    } finally {
      setRegistering(false);
    }
  };

  // Додаємо функцію для визначення, чи користувач у команді
  function isUserInTeam(team: Team, userId: string | null) {
    if (!userId) return false;
    return team.members?.some((m) => String(m.id) === String(userId));
  }

  // Додаємо функцію для визначення, чи користувач є капітаном команди
  function isUserCaptain(team: Team, userId: string | null) {
    if (!userId || !team.members) return false;
    return team.members.some((m) => String(m.id) === String(userId) && m.is_captain === true);
  }

  // Сортуємо так, щоб команда користувача була першою
  const sortedTournamentTeams = [
    ...(tournamentTeams.filter((team) => isUserInTeam(team, userId))),
    ...(tournamentTeams.filter((team) => !isUserInTeam(team, userId))),
  ];

  // Знаходимо команду користувача
  const myTeam = tournamentTeams.find((team) => isUserInTeam(team, userId));
  const isCaptain = myTeam ? isUserCaptain(myTeam, userId) : false;

  console.log('created_by', tournament?.created_by, typeof tournament?.created_by);
  console.log('userId', userId, typeof userId);
  console.log('tournamentTeams', tournamentTeams);
  tournamentTeams.forEach(team => {
    console.log('team', team.name, 'members', team.members);
  });
  console.log('myTeam', myTeam);
  console.log('members', myTeam?.members);
  console.log('isCaptain', isCaptain);

  // Додаємо функцію для парсингу дати з бекенду
  function parseBackendDate(str: string | undefined) {
    if (!str) return null;
    return new Date(str.replace(" ", "T"));
  }

  // Додаємо стани для статусу готовності
  const [readyStatus, setReadyStatus] = useState<"waiting" | "open" | "closed">("waiting");
  const [readyTimer, setReadyTimer] = useState<string>("");
  const [readyEndTimer, setReadyEndTimer] = useState<string>("");

  // Додаємо стан для завантаження готовності
  const [readyLoading, setReadyLoading] = useState(false);

  useEffect(() => {
    if (!tournament?.ready_start || !tournament?.ready_end) return;

    const readyStart = parseBackendDate(tournament.ready_start);
    const readyEnd = parseBackendDate(tournament.ready_end);

    const formatDiff = (ms: number) => {
      const totalSeconds = Math.max(0, Math.floor(ms / 1000));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const updateStatus = () => {
      const now = new Date();
      if (readyStart && now < readyStart) {
        setReadyStatus("waiting");
        setReadyTimer(formatDiff(readyStart.getTime() - now.getTime()));
      } else if (readyStart && readyEnd && now >= readyStart && now < readyEnd) {
        setReadyStatus("open");
        setReadyEndTimer(formatDiff(readyEnd.getTime() - now.getTime()));
      } else {
        setReadyStatus("closed");
        setReadyEndTimer("00:00:00");
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [tournament?.ready_start, tournament?.ready_end]);

  // Визначаємо, чи користувач вже підтвердив готовність
  const isReady = !!myTeam?.confirmed_players?.includes(Number(userId));

  // Визначаємо, чи команда повністю готова
  const isTeamFullyReady =
    !!myTeam &&
    Array.isArray(myTeam.confirmed_players) &&
    myTeam.confirmed_players.length === tournament?.players_per_team;

  // Підрахунок готових команд
  const readyTeamsCount = tournamentTeams.filter(
    (team: any) =>
      Array.isArray(team.confirmed_players) &&
      team.confirmed_players.length === tournament.players_per_team
  ).length;

  if (loading) {
    return <div className="text-center text-white pt-32">Завантаження...</div>;
  }

  if (!tournament) {
    return <div className="text-center text-red-500 pt-32">Турнір не знайдено</div>;
  }

  return (
    <div className="min-h-screen bg-esports-gray pt-20 pb-10">
      <div className="container mx-auto px-4">
        {/* Верхній блок з банером і таймером */}
        <div className="relative h-56 w-full mb-4 rounded-xl overflow-hidden flex items-end">
          <img
            src={tournament.bannerUrl}
            alt={tournament.name}
            className="w-full h-full object-cover absolute inset-0"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-end w-full justify-between p-8">
            <div>
              <h1 className="text-4xl font-bold text-white">{tournament.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="bg-cyan-600 text-white px-3 py-1 rounded">{tournament.status}</span>
                <span className="text-white">
                  {new Date(tournament.start_date).toLocaleString("uk-UA", {
                    weekday: "short",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {/* <div className="text-gray-400 mt-1 text-sm">
                Приблизно через {timeLeft}
              </div> */}
            </div>
            <div className="text-right">
              <div className="text-white text-sm">
                <span className="font-semibold">Почнеться через</span> <span className="font-mono">{timeLeft}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Плашка або кнопка для входу/готовності */}
        <div className="mb-2">
          {tournamentUsers.some(user => String(user.id) === userId) ? (
            readyStatus === "open" && myTeam ? (
              <div className="bg-cyan-700/90 rounded-lg p-3 flex flex-col md:flex-row items-center gap-4">
                <span className="text-white text-sm flex-1">
                  <span className="inline-flex items-center gap-2">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="inline-block"><circle cx="12" cy="12" r="10" fill="#fff" fillOpacity="0.2"/><path d="M12 8v4l3 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {isReady ? (
                      isTeamFullyReady ? (
                        // Якщо команда повністю готова
                        <>Чекайте початок гри. Вам надішлють сервер для входу протягом трьох хвилин.</>
                      ) : (
                        // Якщо ще не всі підтвердили
                        <>Ви підтвердили готовність. Очікуйте інших учасників команди.</>
                      )
                    ) : (
                      <>
                        Підтвердіть готовність до&nbsp;
                        {tournament.ready_end
                          ? new Date(tournament.ready_end.replace(" ", "T")).toLocaleString("uk-UA")
                          : "--"}
                        . Залишилось: <span className="font-mono">{readyEndTimer}</span>
                      </>
                    )}
                  </span>
                </span>
                <div className="flex gap-2">
                  {isReady ? (
                    <Button
                      variant="destructive"
                      disabled={readyLoading}
                      onClick={async () => {
                        setReadyLoading(true);
                        const token = localStorage.getItem("token");
                        await fetch(`http://localhost:3000/tournaments/${id}/ready`, {
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        // Оновити команди після зміни
                        fetch(`http://localhost:3000/tournaments/${id}/teams`, {
                          headers: { Authorization: `Bearer ${token}` }
                        })
                          .then((res) => res.json())
                          .then((data) => setTournamentTeams(data));
                        setReadyLoading(false);
                      }}
                    >
                      Відмінити готовність
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      disabled={readyLoading}
                      onClick={async () => {
                        setReadyLoading(true);
                        const token = localStorage.getItem("token");
                        await fetch(`http://localhost:3000/tournaments/${id}/ready`, {
                          method: "POST",
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        // Оновити команди після зміни
                        fetch(`http://localhost:3000/tournaments/${id}/teams`, {
                          headers: { Authorization: `Bearer ${token}` }
                        })
                          .then((res) => res.json())
                          .then((data) => setTournamentTeams(data));
                        setReadyLoading(false);
                      }}
                    >
                      Підтвердити готовність
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              // Плашка підтвердження готовності (як на фото)
              <div className="bg-cyan-700/90 rounded-lg p-3 flex flex-col md:flex-row items-center gap-4">
                <span className="text-white text-sm flex-1">
                  <span className="inline-flex items-center gap-2">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="inline-block"><circle cx="12" cy="12" r="10" fill="#fff" fillOpacity="0.2"/><path d="M12 8v4l3 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {readyStatus === "waiting" && (
                      <>
                        Чекаємо, коли відкриється вікно підтвердження (це відбудеться&nbsp;
                        {tournament.ready_start
                          ? new Date(tournament.ready_start.replace(" ", "T")).toLocaleString("uk-UA")
                          : "--"}
                        ). Залишилось: <span className="font-mono">{readyTimer}</span>
                      </>
                    )}
                    {readyStatus === "open" && (
                      <>
                        Підтвердіть готовність до&nbsp;
                        {tournament.ready_end
                          ? new Date(tournament.ready_end.replace(" ", "T")).toLocaleString("uk-UA")
                          : "--"}
                        . Залишилось: <span className="font-mono">{readyEndTimer}</span>
                      </>
                    )}
                    {readyStatus === "closed" && (
                      <>
                        Вікно готовності закрите. Більше не можна підтвердити готовність.
                      </>
                    )}
                  </span>
                </span>
                <div className="flex gap-2">
                  {/* <Button variant="secondary">Редагування</Button> <-- Видалено */}
                  <Button
                    variant={readyStatus === "open" ? "default" : "outline"}
                    disabled={readyStatus !== "open"}
                    onClick={() => {
                      // Тут буде логіка підтвердження (поки що просто зміна кольору)
                    }}
                  >
                    Підтвердити готовність
                  </Button>
                </div>
              </div>
            )
          ) : (
            // Кнопка "Війти в турнір"
            <div className="flex justify-end">
              <Button
                variant="default"
                onClick={() => {
                  setShowJoinModal(true);
                  fetchCaptainTeams();
                }}
              >
                Війти в турнір
              </Button>
            </div>
          )}
        </div>
        {/* Далі Tabs як було */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Огляд</TabsTrigger>
            <TabsTrigger value="bracket">Сітка</TabsTrigger>
            <TabsTrigger value="matches">Матчі</TabsTrigger>
            <TabsTrigger value="teams">Команди</TabsTrigger>
            {(isCaptain) && (
              <TabsTrigger value="team-settings">Налаштування команди</TabsTrigger>
            )}
            {tournament && String(tournament.created_by) === String(userId) && (
              <TabsTrigger value="settings">Налаштування турніру</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Ліва частина: Формат + Інформація */}
              <div className="md:col-span-2 space-y-6">
                {/* Формат */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Приклад картки формату */}
                  <div className="p-4 bg-[#23263a] rounded-lg">
                    <div className="font-bold text-white mb-2">Формат</div>
                    <div className="text-gray-300">{tournament.format}</div>
                  </div>
                  <div className="p-4 bg-[#23263a] rounded-lg">
                    <div className="font-bold text-white mb-2">Розмір команди</div>
                    <div className="text-gray-300">{tournament.players_per_team} на {tournament.players_per_team}</div>
                  </div>
                  {/* Додай інші картки формату за потреби */}
                </div>
                {/* Інформація */}
                <div>
                  <div className="font-bold text-white mb-2">Інформація</div>
                  <div className="text-white font-semibold">{tournament.description}</div>
                  <div className="mt-4">
                    <div className="font-bold text-white mb-2">Правила</div>
                    <div className="text-gray-300 whitespace-pre-line">{tournament.rules}</div>
                  </div>
                </div>
              </div>
              {/* Права частина: Гравці + Графік */}
              <div className="space-y-6">
                {/* Гравці */}
                <div className="p-4 bg-[#23263a] rounded-lg">
                  <div className="font-bold text-white mb-2">Гравці</div>
                  <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
                    <div>
                      Учасників <span className="text-white font-bold">{tournamentUsers.length}</span>
                    </div>
                    <div>
                      Готово команд <span className="text-white font-bold">{readyTeamsCount}</span>
                    </div>
                    <div>
                      Слоти <span className="text-white font-bold">{tournamentTeams.length} / {tournament.max_teams || 16}</span>
                    </div>
                  </div>
                  <div className="border-b border-gray-700 mb-2" />
                  <div className="flex items-center space-x-[-10px] mb-1">
                    {(tournament.teams || []).slice(0, 4).map((team, idx) => (
                      <img
                        key={team.id}
                        src={team.avatar}
                        alt={team.name}
                        className="w-8 h-8 rounded-full border-2 border-[#23263a] z-10"
                        style={{ marginLeft: idx === 0 ? 0 : -10 }}
                      />
                    ))}
                    {(tournament.teams?.length || 0) > 4 && (
                      <span className="ml-2 text-xs text-gray-400">
                        + ещё {tournament.teams.length - 4} учасн.
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {(tournament.teams || []).slice(0, 2).map((team) => team.name).join(", ")}
                    {tournament.teams && tournament.teams.length > 2 && (
                      <> и ещё {tournament.teams.length - 2} учасн. зарегистрированы</>
                    )}
                  </div>
                </div>
                {/* Графік */}
                <div className="p-4 bg-[#23263a] rounded-lg">
                  <div className="font-bold text-white mb-2">Графік</div>
                  <div className="space-y-4">
                    {/* Вікно готовності відкривається */}
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="bg-[#181a23] text-white text-xs font-bold px-2 py-1 rounded">
                          {tournament.ready_start
                            ? new Date(tournament.ready_start).toLocaleString("uk-UA", { month: "2-digit" })
                            : "--"}
                          <br />
                          {tournament.ready_start
                            ? new Date(tournament.ready_start).toLocaleString("uk-UA", { day: "2-digit" })
                            : "--"}
                        </div>
                        <div className="h-full w-px bg-gray-700 flex-1" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">
                          {tournament.ready_start
                            ? new Date(tournament.ready_start).toLocaleString("uk-UA", {
                                weekday: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                                timeZone: "Europe/Kyiv"
                              })
                            : "--"}
                        </div>
                        <div className="font-semibold text-white">Вікно готовності відкривається</div>
                        <div className="text-xs text-gray-400">
                          Підтвердіть готовність і підтвердьте, що можете грати.
                        </div>
                      </div>
                    </div>
                    {/* Реєстрація закрита */}
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="bg-[#181a23] text-white text-xs font-bold px-2 py-1 rounded">
                          {tournament.registration_end
                            ? new Date(tournament.registration_end).toLocaleString("uk-UA", { month: "2-digit" })
                            : "--"}
                          <br />
                          {tournament.registration_end
                            ? new Date(tournament.registration_end).toLocaleString("uk-UA", { day: "2-digit" })
                            : "--"}
                        </div>
                        <div className="h-full w-px bg-gray-700 flex-1" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">
                          {tournament.registration_end
                            ? new Date(tournament.registration_end).toLocaleString("uk-UA", {
                                weekday: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                                timeZone: "Europe/Kyiv"
                              })
                            : "--"}
                        </div>
                        <div className="font-semibold text-white">Реєстрація закрита</div>
                        <div className="text-xs text-gray-400">
                          Більше не можна зареєструватися.
                        </div>
                      </div>
                    </div>
                    {/* Вікно готовності закривається */}
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="bg-[#181a23] text-white text-xs font-bold px-2 py-1 rounded">
                          {tournament.ready_end
                            ? new Date(tournament.ready_end).toLocaleString("uk-UA", { month: "2-digit" })
                            : "--"}
                          <br />
                          {tournament.ready_end
                            ? new Date(tournament.ready_end).toLocaleString("uk-UA", { day: "2-digit" })
                            : "--"}
                        </div>
                        <div className="h-full w-px bg-gray-700 flex-1" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">
                          {tournament.ready_end
                            ? new Date(tournament.ready_end).toLocaleString("uk-UA", {
                                weekday: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                                timeZone: "Europe/Kyiv"
                              })
                            : "--"}
                        </div>
                        <div className="font-semibold text-white">Вікно готовності закривається</div>
                        <div className="text-xs text-gray-400">
                          Більше не можна підтвердити готовність.
                        </div>
                      </div>
                    </div>
                    {/* Старт */}
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="bg-[#181a23] text-white text-xs font-bold px-2 py-1 rounded">
                          {tournament.start_date
                            ? new Date(tournament.start_date).toLocaleString("uk-UA", { month: "2-digit" })
                            : "--"}
                          <br />
                          {tournament.start_date
                            ? new Date(tournament.start_date).toLocaleString("uk-UA", { day: "2-digit" })
                            : "--"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">
                          {tournament.start_date
                            ? new Date(tournament.start_date).toLocaleString("uk-UA", {
                                weekday: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                                timeZone: "Europe/Kyiv"
                              })
                            : "--"}
                        </div>
                        <div className="font-semibold text-white">Старт</div>
                        <div className="text-xs text-gray-400">Початок змагання</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="bracket">
            <div className="bg-[#23263a] rounded-lg p-4 min-h-[120px] text-muted-foreground">
              Тут буде сітка турніру
            </div>
          </TabsContent>
          <TabsContent value="matches">
            <div className="bg-[#23263a] rounded-lg p-4 min-h-[120px] text-muted-foreground">
              Тут буде список матчів
            </div>
          </TabsContent>
          <TabsContent value="teams">
            <div className="bg-[#23263a] rounded-lg p-4 min-h-[120px]">
              <h2 className="text-white font-bold mb-4 text-lg">Команди турніру</h2>
              {teamsLoading ? (
                <div className="text-gray-400">Завантаження...</div>
              ) : sortedTournamentTeams.length === 0 ? (
                <div className="text-gray-400">Ще немає зареєстрованих команд</div>
              ) : (
                <ul className="space-y-3">
                  {sortedTournamentTeams.map((team) => {
                    const isMyTeam = isUserInTeam(team, userId);
                    return (
                      <li
                        key={team.id}
                        className={`flex items-center gap-3 rounded px-3 py-2 cursor-pointer transition-colors duration-200
                          bg-[#181a23] hover:bg-cyan-700/80 hover:shadow-lg text-white`}
                        onClick={() => navigate(`/teams/${team.id}`)}
                        title={`Перейти до команди ${team.name}`}
                      >
                        <img
                          src={team.avatar || "/default-team-avatar.png"}
                          alt={team.name}
                          className="w-8 h-8 rounded-full border border-gray-700"
                        />
                        <span className="font-semibold">{team.name}</span>
                        {team.discipline && (
                          <span className="ml-auto text-xs text-cyan-400">{team.discipline}</span>
                        )}
                        {isMyTeam && (
                          <span className="ml-2 px-2 py-0.5 rounded bg-white/20 text-xs font-bold text-white border border-esports-blue">
                            Ваша команда
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </TabsContent>
          <TabsContent value="team-settings">
            <div className="bg-[#23263a] rounded-lg p-4 min-h-[120px] text-white">
              <h2 className="font-bold mb-4 text-lg">Налаштування команди</h2>
              <Button
                variant="destructive"
                onClick={() => setShowLeaveModal(true)}
              >
                Вийти з турніру
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="bg-[#23263a] rounded-lg p-4 min-h-[120px] text-white">
              <h2 className="font-bold mb-4 text-lg">Налаштування турніру</h2>
              <div className="flex flex-col gap-4 max-w-xs">
                <Button
                  variant="default"
                  onClick={() => {
                    // Тут буде логіка старту турніру
                    alert("Турнір буде розпочато (болванка)");
                  }}
                >
                  Розпочати турнір
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Видалити турнір
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* --- Модальне вікно --- */}
        <Dialog open={showJoinModal} onClose={() => setShowJoinModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/60" />
            <div className="relative bg-[#23263a] rounded-lg p-6 w-full max-w-md mx-auto z-10">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                onClick={() => setShowJoinModal(false)}
              >
                <X size={20} />
              </button>
              <Dialog.Title className="text-lg font-bold text-white mb-4">
                Зареєструвати команду
              </Dialog.Title>
              <div className="mb-3">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded bg-[#181a23] text-white"
                  placeholder="Введіть назву команди"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedTeam(null);
                  }}
                />
              </div>
              <div className="max-h-40 overflow-y-auto mb-3">
                {filteredTeams.length === 0 && (
                  <div className="text-gray-400 text-sm">Немає команд</div>
                )}
                {filteredTeams.map((team) => (
                  <div
                    key={team.id}
                    className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
                      selectedTeam?.id === team.id
                        ? "bg-cyan-700 text-white"
                        : "hover:bg-[#181a23] text-gray-200"
                    }`}
                    onClick={() => setSelectedTeam(team)}
                  >
                    <img
                      src={team.avatar}
                      alt={team.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{team.name}</span>
                  </div>
                ))}
              </div>
              {registerError && (
                <div className="text-red-400 text-sm mb-2">{registerError}</div>
              )}
              {registerSuccess && (
                <div className="text-green-400 text-sm mb-2">{registerSuccess}</div>
              )}
              <Button
                variant="default" // було "primary"
                className="w-full"
                disabled={!selectedTeam || registering}
                onClick={handleRegister}
              >
                {registering ? "Реєстрація..." : "Зареєструвати"}
              </Button>
            </div>
          </div>
        </Dialog>

        {/* --- Модальне вікно підтвердження виходу з турніру --- */}
        <Dialog open={showLeaveModal} onClose={() => setShowLeaveModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/60" />
            <div className="relative bg-[#23263a] rounded-lg p-6 w-full max-w-md mx-auto z-10">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                onClick={() => setShowLeaveModal(false)}
              >
                <X size={20} />
              </button>
              <Dialog.Title className="text-lg font-bold text-white mb-4">
                Підтвердження виходу
              </Dialog.Title>
              <div className="mb-4 text-gray-200">
                Ви впевнені, що хочете <span className="text-red-400 font-bold">вийти з турніру</span> цією командою?
              </div>
              {leaveError && (
                <div className="text-red-400 text-sm mb-2">{leaveError}</div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowLeaveModal(false)}
                  disabled={leaving}
                >
                  Скасувати
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={leaving}
                  onClick={async () => {
                    setLeaving(true);
                    setLeaveError(null);
                    try {
                      const token = localStorage.getItem("token");
                      const res = await fetch(`http://localhost:3000/tournaments/${id}/remove-team`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ teamId: myTeam?.id }),
                      });
                      if (res.ok) {
                        window.location.reload();
                      } else {
                        setLeaveError("Помилка при виході з турніру");
                      }
                    } catch {
                      setLeaveError("Помилка мережі");
                    } finally {
                      setLeaving(false);
                    }
                  }}
                >
                  {leaving ? "Вихід..." : "Вийти"}
                </Button>
              </div>
            </div>
          </div>
        </Dialog>

        {/* --- Модальне вікно підтвердження видалення турніру --- */}
        <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/60" />
            <div className="relative bg-[#23263a] rounded-lg p-6 w-full max-w-md mx-auto z-10">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                onClick={() => setShowDeleteModal(false)}
              >
                <X size={20} />
              </button>
              <Dialog.Title className="text-lg font-bold text-white mb-4">
                Підтвердження видалення
              </Dialog.Title>
              <div className="mb-4 text-gray-200">
                Ви впевнені, що хочете <span className="text-red-400 font-bold">видалити турнір</span>?
              </div>
              {deleteError && (
                <div className="text-red-400 text-sm mb-2">{deleteError}</div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Скасувати
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true);
                    setDeleteError(null);
                    try {
                      const token = localStorage.getItem("token");
                      const res = await fetch(`http://localhost:3000/tournaments/${tournament?.id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      if (res.ok) {
                        window.location.href = "/tournaments";
                      } else {
                        setDeleteError("Помилка при видаленні турніру");
                      }
                    } catch {
                      setDeleteError("Помилка мережі");
                    } finally {
                      setDeleting(false);
                    }
                  }}
                >
                  {deleting ? "Видалення..." : "Видалити"}
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default TournamentAdminPanel;