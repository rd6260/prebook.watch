"use client";

import { useState } from "react";

const genres = ["All Genres", "Action", "Sci-Fi", "Drama", "Adventure", "Animation", "Horror", "Comedy"];

export default function GenreFilter() {
  const [active, setActive] = useState("All Genres");

  return (
    <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => setActive(genre)}
          className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
            active === genre
              ? "bg-[hsl(181_100%_9%)] text-white"
              : "bg-white text-[hsl(181_100%_9%)] border border-[hsl(181_54%_37%/0.15)] hover:bg-[hsl(181_100%_9%)] hover:text-white"
          }`}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}
