import React, { useState, useEffect, useRef } from "react";
import { X, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const templates = [
	{
		id: "1",
		name: "5v5 - Bomb Defusal",
		desc: "Європа • 5v5 • 32 места • Вибування после одного пораження...",
		img: "https://i.imgur.com/7QpQK5F.png",
	},
	{
		id: "2",
		name: "2v2 - Wingman",
		desc: "Європа • 2v2 • 32 места • Вибування после одного пораження...",
		img: "https://i.imgur.com/8QpQK5F.png",
	},
	{
		id: "3",
		name: "1vs1 - Aim Maps",
		desc: "Європа • 1v1 • 32 места • Вибування после одного пораження...",
		img: "https://i.imgur.com/9QpQK5F.png",
	},
];

const steps = ["Шаблон", "General", "Teams", "Date"];

const templateData: Record<string, { format: string; description: string; rules: string; playersPerTeam: string }> = {
  "1": {
    format: "5v5 - Bomb Defusal",
    description: "Класичний режим 5 на 5. Команди змагаються у встановленні або знешкодженні бомби. Турнір для досвідчених гравців.",
    rules: "Гра проходить за стандартними правилами CS. Заборонено використання стороннього ПЗ, чіти, образи в чаті. Кожна команда має 5 гравців.",
    playersPerTeam: "5v5"
  },
  "2": {
    format: "2v2 - Wingman",
    description: "Динамічний режим 2 на 2. Ідеально для швидких матчів та командної взаємодії.",
    rules: "Гра проходить на Wingman-картах. Заборонено чіти, стороннє ПЗ, образи. Кожна команда має 2 гравців.",
    playersPerTeam: "2v2"
  },
  "3": {
    format: "1v1 - Aim Maps",
    description: "Індивідуальні дуелі на aim-картах. Перевір свої навички стрільби проти інших гравців.",
    rules: "Гра проходить на aim-картах. Заборонено чіти, стороннє ПЗ, образи. Один гравець проти одного.",
    playersPerTeam: "1v1"
  }
};

// Додаємо функцію stripSeconds
function stripSeconds(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes()
  );
}

const CreateTournamentModal = ({
	onClose,
	onCreated,
}: {
	onClose: () => void;
	onCreated: (id: string) => void;
}) => {
	const [step, setStep] = useState(0);
	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
	const [tournamentName, setTournamentName] = useState("");
	const [playersPerTeam, setPlayersPerTeam] = useState("5v5");
	const [date, setDate] = useState("");
	const [gmt, setGmt] = useState("GMT+3");
	const [format, setFormat] = useState("");
	const [rules, setRules] = useState("");
	const [description, setDescription] = useState("");
	const [maxTeams, setMaxTeams] = useState(8);
	const [endDate, setEndDate] = useState(""); // можна залишити, але не використовувати
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [readyStart, setReadyStart] = useState("");
	const [readyEnd, setReadyEnd] = useState("");
	const [registrationEnd, setRegistrationEnd] = useState(""); // ДОДАЙ ЦЕЙ РЯДОК
	const [nameError, setNameError] = useState<string | null>(null);
	const debounceRef = useRef<NodeJS.Timeout | null>(null);

	// Мок користувача
	const username = "cdiimmaa220033";

	// Мок створення турніру
	const handleCreate = async () => {
    setError(null);

    const now = new Date();
    const start = date ? new Date(date) : null;
    const regEnd = registrationEnd ? new Date(registrationEnd) : null;
    const readyS = readyStart ? new Date(readyStart) : null;
    const readyE = readyEnd ? new Date(readyEnd) : null;

    // Валідація
    if (!start || start <= now) {
        setError("Дата початку турніру повинна бути у майбутньому.");
        return;
    }
    if (!regEnd || regEnd < now) {
        setError("Дата закриття реєстрації повинна бути у майбутньому.");
        return;
    }
    if (regEnd > start) {
        setError("Дата закриття реєстрації не може бути пізніше дати початку турніру.");
        return;
    }
    if (!readyS || stripSeconds(readyS) < stripSeconds(now) || readyS > start) {
        setError("Дата відкриття підтвердження повинна бути не меншою за поточну дату і не більшою за дату початку турніру.");
        return;
    }
    if (!readyE || readyE < readyS) {
        setError("Кінець підтвердження не може бути раніше початку підтвердження.");
        return;
    }
    if (readyE > start) {
        setError("Кінець підтвердження не може бути пізніше дати початку турніру.");
        return;
    }
    if (!readyS || readyS > readyE) {
        setError("Початок підтвердження не може бути пізніше за кінець підтвердження.");
        return;
    }

    setLoading(true);
    try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/tournaments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                name: tournamentName,
                format,
                rules,
                description,
                start_date: date,
                ready_start: readyStart,
                ready_end: readyEnd,
                registration_end: registrationEnd,
                max_teams: maxTeams,
                status: "запланований",
                players_per_team: Number(playersPerTeam.split("v")[0])
            }),
        });
        if (!res.ok) throw new Error("Турнір з таким ім'ям вже існує або сталася помилка сервера");
        const data = await res.json();
        onCreated(data.tournament.id);
    } catch (e: any) {
      if (e?.response?.status === 409) {
        setError("Турнір з такою назвою вже існує");
      } else if (e?.response?.status === 403) {
        setError("У вас немає прав для створення турніру");
      } else {
        setError(e.message || "Сталася помилка сервера");
      }
    }
    setLoading(false);
	};

	// Вибір шаблону
	const selectedTemplateObj = templates.find((t) => t.id === selectedTemplate);

	// При переході на Step 1, якщо вибрано шаблон — підставляємо дані
	React.useEffect(() => {
    if (step === 1 && selectedTemplate && selectedTemplate !== "custom") {
        const t = templateData[selectedTemplate];
        setFormat(t.format);
        setDescription(t.description);
        setRules(t.rules);
        setPlayersPerTeam(t.playersPerTeam);
    }
    if (step === 1 && selectedTemplate === "custom") {
        setFormat(""); // поле буде пусте
        setDescription("");
        setRules("");
        setPlayersPerTeam("5v5");
    }
    // eslint-disable-next-line
}, [step, selectedTemplate]);

  // Автоматичне підставлення дат після вибору дати початку
  useEffect(() => {
    if (date) {
      // Якщо дата початку вже вибрана
      setRegistrationEnd(date);
      setReadyEnd(date);
      // Поточний час у форматі "YYYY-MM-DDTHH:mm"
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setReadyStart(local);
    }
  }, [date]);

	const checkNameUnique = async (name: string) => {
		try {
			const res = await fetch(`http://localhost:3000/tournaments/check-name?name=${encodeURIComponent(name)}`);
			const data = await res.json();
			return !data.exists; // якщо існує — повертає false
		} catch {
			return true; // якщо помилка, не блокуємо
		}
	};

	return (
		<div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
			<div className="relative bg-[#23263a] rounded-2xl shadow-xl w-full max-w-xl mx-auto p-0 overflow-hidden">
				{/* Верхній блок з картинкою та stepper */}
				<div className="relative bg-gradient-to-r from-[#23263a] to-[#f9a825] p-6 pb-0">
					<button className="absolute top-4 right-4" onClick={onClose}>
						<X className="w-6 h-6 text-white" />
					</button>
					<div className="relative z-10 flex flex-col items-center">
						<h2 className="text-2xl font-bold mb-2 text-white mt-6">
							Create tournament
						</h2>
						<div className="flex justify-between w-full max-w-xs mb-2">
							{steps.map((s, i) => (
								<div key={s} className="flex-1 flex flex-col items-center">
									<div
										className={`w-6 h-6 rounded-full flex items-center justify-center ${
											i <= step ? "bg-cyan-400" : "bg-gray-600"
										}`}
									></div>
									<span
										className={`text-xs mt-1 ${
											i === step ? "font-bold text-white" : "text-gray-300"
										}`}
									>
										{s}
									</span>
								</div>
							))}
						</div>
						<div className="w-full h-1 bg-gray-700 rounded-full mb-2">
							<div
								className="h-1 bg-cyan-400 rounded-full transition-all"
								style={{ width: `${((step + 1) / steps.length) * 100}%` }}
							></div>
						</div>
					</div>
				</div>

				{/* Контент кроків */}
				<div className="p-6 pt-2">
					{/* Step 0: Вибір шаблону */}
					{step === 0 && (
						<>
							<div className="mb-2 font-bold text-white">По шаблону</div>
							<div className="text-sm text-gray-400 mb-4">
								Виберіть шаблон із нашої підбірки або створіть свій турнір з нуля. Що б
								ви не вибрали, ви зможете змінити налаштування турніру пізніше.
							</div>
							<div className="flex flex-col gap-3 mb-4">
								{templates.map((t) => (
  <label
    key={t.id}
    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border ${
      selectedTemplate === t.id
        ? "border-cyan-400 bg-cyan-900/30"
        : "border-gray-700 hover:bg-gray-700/40"
    }`}
  >
    <input
      type="radio"
      name="template"
      checked={selectedTemplate === t.id}
      onChange={() => setSelectedTemplate(t.id)}
      className="accent-cyan-400"
    />
    {/* <img
      src={t.img}
      alt={t.name}
      className="w-16 h-10 rounded object-cover"
    /> */}
    <div>
      <div className="font-semibold text-white">{t.name}</div>
      <div className="text-xs text-gray-400">{t.desc}</div>
    </div>
  </label>
))}
								<label
									className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border ${
										selectedTemplate === "custom"
											? "border-cyan-400 bg-cyan-900/30"
											: "border-gray-700 hover:bg-gray-700/40"
									}`}
								>
									<input
										type="radio"
										name="template"
										checked={selectedTemplate === "custom"}
										onChange={() => setSelectedTemplate("custom")}
										className="accent-cyan-400"
									/>
									<div className="font-semibold text-white">
										Створити турнір без шаблона
									</div>
								</label>
							</div>
							<Button
								className="w-full mt-2"
								disabled={!selectedTemplate}
								onClick={() => setStep(step + 1)}
							>
								Next
							</Button>
						</>
					)}

					{/* Step 1: General */}
					{step === 1 && (
						<>
							<div className="mb-2 font-bold text-white">Назва турніру</div>
							<input
								className="w-full p-2 rounded bg-[#181a23] text-white mb-1 border border-gray-700 focus:outline-none focus:border-cyan-400"
								value={tournamentName}
								onChange={(e) => {
									setTournamentName(e.target.value);
									setNameError(null); // скидаємо помилку при зміні
								}}
								placeholder="Tournament name"
							/>
							{nameError && (
  <div className="text-red-500 mb-2">{nameError}</div>
)}
							<div className="mb-2 font-bold text-white">Формат</div>
{selectedTemplate === "custom" ? (
  <input
    className="w-full p-2 rounded bg-[#181a23] text-white mb-4 border border-gray-700"
    value={format}
    onChange={(e) => setFormat(e.target.value)}
    placeholder="Вкажіть формат турніру"
  />
) : (
  <select
    className="w-full p-2 rounded bg-[#181a23] text-white mb-4 border border-gray-700"
    value={format}
    onChange={(e) => setFormat(e.target.value)}
  >
    <option value="5v5 - Bomb Defusal">5v5 - Bomb Defusal</option>
    <option value="2v2 - Wingman">2v2 - Wingman</option>
    <option value="1v1 - Aim Maps">1v1 - Aim Maps</option>
  </select>
)}
							<div className="mb-2 font-bold text-white">Опис</div>
							<textarea
								className="w-full p-2 rounded bg-[#181a23] text-white mb-4 border border-gray-700"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Короткий опис турніру"
							/>
							<div className="mb-2 font-bold text-white">Правила</div>
							<textarea
								className="w-full p-2 rounded bg-[#181a23] text-white mb-4 border border-gray-700"
								value={rules}
								onChange={(e) => setRules(e.target.value)}
								placeholder="Вкажіть основні правила"
							/>
							<div className="flex justify-between mt-4">
								<Button variant="outline" onClick={() => setStep(step - 1)}>
									Back
								</Button>
								<Button
									onClick={async () => {
										setLoading(true);
										const unique = await checkNameUnique(tournamentName);
										setLoading(false);
										if (!unique) {
											setNameError("Турнір з такою назвою вже існує");
											return;
										}
										setStep(step + 1);
									}}
									disabled={!tournamentName || !format || !description || loading}
									className="bg-cyan-500 text-white"
								>
									Next
								</Button>
							</div>
						</>
					)}

					{/* Step 2: Teams */}
					{step === 2 && (
						<>
							<div className="mb-2 font-bold text-white">Кількість команд</div>
							<input
								type="number"
								min={2}
								max={64}
								className="w-full p-2 rounded bg-[#181a23] text-white mb-4 border border-gray-700"
								value={maxTeams}
								onChange={(e) => setMaxTeams(Number(e.target.value))}
								placeholder="max teams"
							/>
							{/* Якщо шаблон custom, показуємо вибір гравців у команді */}
							{selectedTemplate === "custom" && (
								<>
									<div className="mb-2 font-bold text-white">Гравців у команді</div>
									<div className="flex flex-col gap-2 mb-4">
										{["1v1", "2v2", "3v3", "4v4", "5v5"].map((opt) => (
											<label
												key={opt}
												className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border ${
													playersPerTeam === opt
														? "border-cyan-400 bg-cyan-900/30"
														: "border-gray-700 hover:bg-gray-700/40"
												}`}
											>
												<input
													type="radio"
													name="playersPerTeam"
													checked={playersPerTeam === opt}
													onChange={() => setPlayersPerTeam(opt)}
													className="accent-cyan-400"
												/>
												<span className="text-white">{opt}</span>
											</label>
										))}
									</div>
								</>
							)}
							{/* Якщо шаблон НЕ custom, не показуємо вибір гравців у команді */}
							<div className="flex justify-between mt-4">
								<Button variant="outline" onClick={() => setStep(step - 1)}>
									Back
								</Button>
								<Button
									onClick={() => setStep(step + 1)}
									className="bg-cyan-500 text-white"
								>
									Next
								</Button>
							</div>
						</>
					)}

					{/* Step 3: Date */}
					{step === 3 && (
						<>
							<div className="mb-2 font-bold text-white">Дата початку</div>
							<input
								type="datetime-local"
								className="bg-[#181a23] text-white rounded p-2 border border-gray-700 mb-4"
								value={date}
								onChange={(e) => setDate(e.target.value)}
							/>
							<div className="mb-2 font-bold text-white">Кінець реєстрації</div>
							<input
								type="datetime-local"
								className="bg-[#181a23] text-white rounded p-2 border border-gray-700 mb-4"
								value={registrationEnd}
								onChange={(e) => setRegistrationEnd(e.target.value)}
							/>
							<div className="mb-2 font-bold text-white">Початок підтвердження готовності</div>
							<input
								type="datetime-local"
								className="bg-[#181a23] text-white rounded p-2 border border-gray-700 mb-4"
								value={readyStart}
								onChange={(e) => setReadyStart(e.target.value)}
							/>
							<div className="mb-2 font-bold text-white">Кінець підтвердження готовності</div>
							<input
								type="datetime-local"
								className="bg-[#181a23] text-white rounded p-2 border border-gray-700 mb-4"
								value={readyEnd}
								onChange={(e) => setReadyEnd(e.target.value)}
							/>
							{error && <div className="text-red-500 mb-2">{error}</div>}
							<div className="flex justify-between mt-4">
								<Button variant="outline" onClick={() => setStep(step - 1)}>
									Back
								</Button>
								<Button
									onClick={handleCreate}
									className="bg-cyan-500 text-white"
									disabled={loading}
								>
									{loading ? "Створення..." : "Створити"}
								</Button>
							</div>
						</>
					)}

					{/* Advanced options */}
					<div className="mt-4">
						<a
							href="#"
							className="text-xs text-cyan-400 underline"
						>
							Advanced options
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreateTournamentModal;