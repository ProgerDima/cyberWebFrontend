import React, { useState } from "react";

const CreateTeamDialog = ({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (team: any) => void;
}) => {
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true); // Додаємо стан
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, discipline: "CS1.6", is_private: isPrivate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Помилка створення команди");
      onCreated(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="p-6 bg-[#23263a] rounded-xl w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-white">Створити команду</h2>
      <label className="block mb-2 text-white">Назва команди</label>
      <input
        className="w-full p-2 rounded bg-[#181a23] text-white mb-4 border border-gray-700"
        value={name}
        onChange={e => setName(e.target.value)}
        minLength={3}
        maxLength={50}
        required
      />
      <label className="block mb-2 text-white">Тип команди</label>
      <div className="flex gap-4 mb-4">
        <label className="flex items-center text-white">
          <input
            type="radio"
            checked={isPrivate}
            onChange={() => setIsPrivate(true)}
            className="mr-2"
          />
          Приватна (тільки організатор може запрошувати)
        </label>
        <label className="flex items-center text-white">
          <input
            type="radio"
            checked={!isPrivate}
            onChange={() => setIsPrivate(false)}
            className="mr-2"
          />
          Публічна (будь-хто може приєднатися)
        </label>
      </div>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded">Скасувати</button>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? "Створення..." : "Створити"}
        </button>
      </div>
    </form>
  );
};

export default CreateTeamDialog;