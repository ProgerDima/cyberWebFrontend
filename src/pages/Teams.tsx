import React, { useState, useEffect } from "react";
import CreateTeamDialog from "./CreateTeamDialog";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Search, Users, Filter } from "lucide-react";
import TeamCard from "@/components/teams/TeamCard";

function getUserIdFromToken(token: string): number | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Number(payload.userId || payload.id); // змінити на своє поле!
    } catch {
        return null;
    }
}

const token = localStorage.getItem("token");
const userId = token ? getUserIdFromToken(token) : null;

const Teams = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [teamName, setTeamName] = useState("");
	const [teamsData, setTeamsData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		setLoading(true);
		fetch("http://localhost:3000/teams")
			.then((res) => res.json())
			.then((data) => setTeamsData(data))
			.finally(() => setLoading(false));
	}, []);

	const filteredTeams = teamsData
		.filter((team) => team.is_private === false)
		.filter((team) => {
			const captain = team.members.find(
				(member: any) => member.role === "Капітан"
			);
			// Виключаємо команди, де ти капітан
			if (captain && captain.id === userId) return false;
			return true;
		})
		.filter((team) => {
			// Виключаємо команди, які вже повні для турніру
			if (team.players_per_team && team.members.length >= team.players_per_team) return false;
			return true;
		})
		.filter((team) => {
			const matchesSearch = (team.teamName ?? team.name ?? "")
				.toLowerCase()
				.includes(searchQuery.toLowerCase());
			return matchesSearch;
		})
		.filter(team => {
			// Якщо команда бере участь у турнірах і хоча б для одного турніру вже повна — не показуємо
			if (team.tournaments && team.tournaments.some(
				t => typeof t.players_per_team === "number" && team.members.length >= t.players_per_team
			)) {
				return false;
			}
			return true;
		});

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		setShowCreateForm(false);
		setTeamName("");
		// navigate до нової команди після створення
	};

	const handleTeamCreated = (team: any) => {
		setShowCreateForm(false);
		navigate(`/teams/${team.id || team.teamId}`);
	};

	const reloadTeams = () => {
		setLoading(true);
		fetch("http://localhost:3000/teams")
			.then((res) => res.json())
			.then((data) => setTeamsData(data))
			.finally(() => setLoading(false));
	};

	return (
		<div className="page-transition-wrapper min-h-screen">
			<div className="bg-esports-gray py-20 pt-40">
				<div className="container mx-auto px-6">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
						<div>
							<h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center">
								<Users className="h-7 w-7 mr-3 text-esports-blue" />
								Команди
							</h1>
							<p className="text-muted-foreground max-w-2xl">
								Переглядайте всі зареєстровані команди. Знайдіть потенційних товаришів по команді або суперників для наступного турніру.
							</p>
						</div>
						{token ? (
							<Button
								className="mt-4 md:mt-0 bg-gradient-to-r from-esports-purple to-esports-blue hover:opacity-90 transition-opacity"
								onClick={() => setShowCreateForm(true)}
							>
								Створити команду
							</Button>
						) : (
							<p className="text-red-500 mt-2 text-sm">
								Щоб створити команду, потрібно авторизуватись.
							</p>
						)}
					</div>

					{/* Filters */}
					<div className="bg-card/30 backdrop-blur-md border border-border rounded-lg p-4 mb-8">
						<div className="flex flex-col md:flex-row gap-4">
							<div className="flex-grow relative">
								<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search teams..."
									className="pl-10"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
						</div>
					</div>

					{/* Results */}
					<div className="mb-6">
						<p className="text-sm text-muted-foreground">
							Showing {filteredTeams.length}{" "}
							{filteredTeams.length === 1 ? "team" : "teams"}
						</p>
					</div>

					{loading ? (
						<div className="text-center py-20 text-white">Завантаження...</div>
					) : filteredTeams.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredTeams.map((team) => (
								<TeamCard
									key={team.teamId}
									team={{
										...team,
										id: team.teamId, // Додаємо id для TeamCard
										name: team.teamName,
										game: team.discipline,
										is_private: team.is_private,
										rank: 1, // якщо немає rank, можна тимчасово поставити 1
									}}
									reloadTeams={reloadTeams}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-20">
							<h3 className="text-xl font-bold mb-2">No teams found</h3>
							<p className="text-muted-foreground">
								Try adjusting your search query.
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Діалогове вікно для створення команди */}
			{showCreateForm && (
				<div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
					<CreateTeamDialog
						onClose={() => setShowCreateForm(false)}
						onCreated={handleTeamCreated}
					/>
				</div>
			)}
		</div>
	);
};

export default Teams;
