const upcoming = [
  {
    title: "Aapke Aa Jane Se",
    releasing: "",
    img: "https://platoon.one/images/production/new/aapke-aa-jane-se.jpg",
  },
  {
    title: "Aakhri Safar",
    releasing: "",
    img: "https://platoon.one/images/production/new/aakhri-safar.jpg",
  },
];

export default function ComingSoon() {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black text-[hsl(181_100%_9%)] uppercase tracking-tight">
          Coming Soon
        </h3>
        <div className="flex gap-2">
          <button className="p-2 rounded-full border border-[hsl(181_54%_37%/0.15)] hover:bg-[hsl(181_100%_9%)] hover:text-white transition-all">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="p-2 rounded-full border border-[hsl(181_54%_37%/0.15)] hover:bg-[hsl(181_100%_9%)] hover:text-white transition-all">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {upcoming.map((movie) => (
          <div
            key={movie.title}
            className="relative h-64 rounded-2xl overflow-hidden shadow-xl group"
          >
            <img
              src={movie.img}
              alt={movie.title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(181_100%_9%/0.9)] to-transparent flex flex-col justify-end p-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
                {movie.releasing}
              </span>
              <h4 className="text-2xl font-black text-white mb-3">{movie.title}</h4>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-xs font-bold text-white hover:text-[hsl(180_100%_89%)] transition-colors">
                  <span className="material-symbols-outlined text-sm">notifications</span>
                  Set Reminder
                </button>
                <button className="flex items-center gap-1 text-xs font-bold text-white hover:text-[hsl(180_100%_89%)] transition-colors">
                  <span className="material-symbols-outlined text-sm">play_circle</span>
                  Watch Trailer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
