"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

type Entry = {
  id: number;
  text: string;
  date: string;
};

export default function HomePage() {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);

  // Load entries from JSON (static file served from public/data)
  useEffect(() => {
    fetch("/data/entries.json")
      .then((res) => res.json())
      .then((data) => setEntries(data));
  }, []);

  // Group entries by month-year
  const groupedEntries = entries.reduce((acc: Record<string, Entry[]>, entry) => {
    const month = format(new Date(entry.date), "MMMM yyyy");
    if (!acc[month]) acc[month] = [];
    acc[month].push(entry);
    return acc;
  }, {});

  const handleSave = async () => {
    if (!text.trim()) return;

    const res = await fetch("/.netlify/functions/save-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      const newEntry = await res.json();
      setEntries((prev) => [newEntry, ...prev]);
      setText("");
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Journal</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write something..."
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
        >
          Save
        </button>
      </div>

      {Object.keys(groupedEntries).map((month) => (
        <div key={month} className="mb-8">
          <h2 className="text-lg font-semibold mb-2">{month}</h2>
          <div className="border-t mb-2"></div>
          <ul className="space-y-2">
            {groupedEntries[month].map((entry) => (
              <li key={entry.id} className="border p-2 rounded">
                <p>{entry.text}</p>
                <span className="text-sm text-gray-500">
                  {format(new Date(entry.date), "dd MMM yyyy, HH:mm")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </main>
  );
}
