export default function Hero() {
  return (
    <section className="relative w-full h-[500px] rounded-2xl overflow-hidden mb-12 group">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/movie_posters/bindusagar_banner.jpg"
          alt="Bindusagar (2025)"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(181_100%_9%)] via-[hsl(181_100%_9%/0.6)] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-2xl text-white">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-1 rounded bg-yellow-500 text-[hsl(181_100%_9%)] font-bold text-xs tracking-widest">
            IMDb
          </span>
          <span className="flex items-center gap-1 text-sm font-medium">
            <span className="material-symbols-outlined text-yellow-500 text-base">star</span>
            8.9 Rating
          </span>
        </div>

        <h2 className="text-5xl md:text-7xl font-black mb-4 leading-tight tracking-tight">
          Bindusagar
        </h2>

        <p className="text-lg text-slate-200 mb-8 font-light line-clamp-3 max-w-lg">
          When a young woman's quest to discover her roots intersects with a grieving father's
          journey to faith, they find redemption and purpose in the ancient city of Bhubaneswar, India.
        </p>

        <div className="flex flex-wrap gap-4">
          <a href="/select-city" className="px-8 py-4 bg-white text-[hsl(181_100%_9%)] rounded-lg font-bold hover:bg-slate-100 transition-all flex items-center gap-2 shadow-xl shadow-black/20">
            <span className="material-symbols-outlined">confirmation_number</span>
            Book Tickets
          </a>
          <a
            href="https://www.youtube.com/watch?v=dVZC20xQmvU"
            target="_blank"
            className="px-8 py-4 bg-[hsl(181_100%_9%/0.4)] backdrop-blur-md border border-white/20 text-white rounded-lg font-bold hover:bg-[hsl(181_100%_9%/0.6)] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">play_circle</span>
            Watch Trailer
          </a>
        </div>
      </div>
    </section>
  );
}
