"use client";
import { useState, useEffect } from "react";

function App() {
  type Track = {
    icon: string;
    name: string;
    id: number;
  };

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tracks from backend when component loads
  useEffect(() => {
    fetch("http://localhost:8000/tracks")
      .then((response) => response.json())
      .then((data) => {
        setTracks(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        CS Career Roadmap
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-4xl mb-2">{track.icon}</div>
            <h2 className="text-xl font-semibold">{track.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
