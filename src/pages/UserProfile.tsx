// filepath: c:\Users\Dmitryi\Desktop\backend\frontend\cyberWebFrontend\src\pages\UserProfile.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/users/${id}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [id]);

  if (!user) return <div className="text-white text-center py-10">Завантаження...</div>;

  return (
    <div className="min-h-screen bg-[#181c2f] py-20 pt-40 flex flex-col items-center">
      <div className="w-40 h-40 rounded-full bg-gray-700 flex items-center justify-center mb-4">
        <span className="text-7xl text-gray-400">👤</span>
      </div>
      <h2 className="text-4xl font-extrabold mb-2 text-white">{user.username}</h2>

      {/* Створені команди */}
      <h3 className="text-white text-lg font-bold mb-2">Створені команди</h3>
      <div className="flex gap-6 flex-wrap mb-8">
        {(!user.createdTeams || user.createdTeams.length === 0) && <div className="text-white">Немає створених команд.</div>}
        {user.createdTeams && user.createdTeams.map((team: any) => (
          <Link to={`/teams/${team.id}`} key={team.id} className="text-white">{team.name}</Link>
        ))}
      </div>

      {/* Команди, в яких учасник */}
      <h3 className="text-white text-lg font-bold mb-2">Команди, в яких учасник</h3>
      <div className="flex gap-6 flex-wrap mb-8">
        {user.joinedTeams.length === 0 && <div className="text-white">Немає команд.</div>}
        {user.joinedTeams.map((team: any) => (
          <Link to={`/teams/${team.id}`} key={team.id} className="text-white">{team.name}</Link>
        ))}
      </div>

      {/* Створені турніри */}
      <h3 className="text-white text-lg font-bold mb-2">Створені турніри</h3>
      <div className="flex gap-6 flex-wrap mb-8">
        {user.createdTournaments.length === 0 && <div className="text-white">Немає створених турнірів.</div>}
        {user.createdTournaments.map((t: any) => (
          <Link to={`/tournaments/${t.id}`} key={t.id} className="text-white">{t.name}</Link>
        ))}
      </div>

      {/* Турніри, в яких бере участь */}
      <h3 className="text-white text-lg font-bold mb-2">Турніри, в яких бере участь</h3>
      <div className="flex gap-6 flex-wrap mb-8">
        {user.joinedTournaments.length === 0 && <div className="text-white">Немає турнірів.</div>}
        {user.joinedTournaments.map((t: any) => (
          <Link to={`/tournaments/${t.id}`} key={t.id} className="text-white">{t.name}</Link>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;

// In your routing file, you should have something like this:
// <Route path="/profile/:id" element={<UserProfile />} />