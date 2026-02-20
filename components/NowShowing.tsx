const movies = [
  {
    title: "Bayaan",
    genre: "Thriller/Drama",
    rating: "8.3",
    rating_label: "14A",
    img: "https://image.tmdb.org/t/p/w600_and_h900_face/ijI7IRqmdCRAN3iDAZ1BlpgLIOm.jpg",
  },
  {
    title: "Ghaath",
    genre: "Drama/Thriller",
    rating: "7.7",
    img: "https://www.themoviedb.org/t/p/w600_and_h900_face/b7bTv9S6UrPnRiwWUPDjHqPgz6e.jpg",
  },
  {
    title: "Bhagwan Bharose",
    genre: "Drama/Comedy/Family",
    rating: "6.7",
    img: "https://www.themoviedb.org/t/p/w600_and_h900_face/8Jh6EckBnZjqlvrTwzQHxiL7ad9.jpg",
  },
  {
    title: "Minimum",
    genre: "Drama",
    rating: "7.1",
    img: "https://platoon.one/images/production/minimum.jpg",
  },
  {
    title: "Toh, Ti Ani Fuji",
    genre: "Romance/Drama",
    rating: "",
    img: "https://m.media-amazon.com/images/M/MV5BNjZjYjhmOTUtNDg2MS00YjcwLTg4NzMtMWY1OTA4NWU0MDVkXkEyXkFqcGc@._V1_.jpg",
  },
];

export default function NowShowing() {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black text-[hsl(181_100%_9%)] uppercase tracking-tight">
          Now Showing
        </h3>
        <a
          href="#"
          className="text-sm font-bold text-[hsl(181_100%_9%)] flex items-center gap-1"
        >
          <span className="hover:underline">View All </span>
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <div key={movie.title} className="group cursor-pointer">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg mb-4">

              {/* Mobile: entire image is a link to /select-city */}
              <a href="/select-city" className="block md:hidden w-full h-full absolute inset-0 z-10" aria-label={`Book ${movie.title}`} />

              <img
                src={movie.img}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Hover Overlay — hidden on mobile, visible on md+ */}
              <div className="absolute inset-0 bg-[hsl(181_100%_9%/0.7)] opacity-0 md:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 hidden md:flex">
                <a href="/select-city" className="w-full text-center py-2 bg-white text-[hsl(181_100%_9%)] rounded font-bold text-sm mb-2 hover:bg-slate-100 transition-colors">
                  Book Now
                </a>
                <button className="w-full py-2 bg-transparent border border-white text-white rounded font-bold text-sm hover:bg-white/10 transition-colors">
                  Details
                </button>
              </div>

              {/* Rating badge */}
              {movie.rating_label && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-[hsl(181_100%_9%)] text-white text-[10px] font-black rounded z-20">
                  {movie.rating_label}
                </div>
              )}
            </div>
            <h4 className="font-bold text-[hsl(181_100%_9%)] mb-1 truncate">{movie.title}</h4>
            <p className="text-xs text-[hsl(181_100%_9%/0.55)] font-medium">
              {movie.genre} • {movie.rating}/10
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
