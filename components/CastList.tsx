"use client";

type CastMember = {
  id: string;
  name: string;
  role: string;
  picture: string;
};

const cast: CastMember[] = [
  {
    id: "1",
    name: "Prakruti Mishra",
    role: "Shreeja",
    picture: "https://media.themoviedb.org/t/p/w300_and_h450_face/cfg1XGQTJ26GHXaUksYAh51sEiK.jpg",
  },
  {
    id: "2",
    name: "Dipanwit Dashmohapatra",
    role: "Sagar",
    picture: "https://media.themoviedb.org/t/p/w300_and_h450_face/mSOpxN8K5aWCO5m1zRWqEG8yvBn.jpg",
  },
  {
    id: "3",
    name: "Sonalli Sharmisstha",
    role: "Kaberi",
    picture: "/cast_and_crew/sonalli-sharmisstha.png",
  },
  {
    id: "4",
    name: "Satya Ranjan",
    role: "Kalia Nana",
    picture: "https://media.themoviedb.org/t/p/w300_and_h450_face/qR1aeX3Mcb5ywPNVpUB9VIUuskg.jpg",
  },
  {
    id: "5",
    name: "Robin Das",
    role: "Raghunath",
    picture: "https://media.themoviedb.org/t/p/w300_and_h450_face/kqbdKYFZbC3bfugX2aCvQ2hq0Me.jpg",
  },
  {
    id: "6",
    name: "Pranab Prasanna Rath",
    role: "Pranakrushna",
    picture: "/cast_and_crew/pranab-prasanna-rath.png",
  },
  {
    id: "7",
    name: "Sukant Rath",
    role: "Santosh Upadhyay",
    picture: "https://media.themoviedb.org/t/p/w300_and_h450_face/dUb0wxZJwXKsUWHG3UIZPFnInyp.jpg",
  },
  {
    id: "8",
    name: "Kishor Kumar Swain",
    role: "Da Dha Na",
    picture: "/cast_and_crew/kishor-kumar-swain.jpeg",
  },
];

const INITIALS_COLORS = [
  "from-teal-400 to-teal-600",
  "from-rose-400 to-rose-600",
  "from-amber-400 to-amber-600",
  "from-violet-400 to-violet-600",
  "from-sky-400 to-sky-600",
  "from-emerald-400 to-emerald-600",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function CastCard({ member, index }: { member: CastMember; index: number }) {
  const colorClass = INITIALS_COLORS[index % INITIALS_COLORS.length];

  return (
    <div className="group flex-shrink-0 flex flex-col items-center gap-2.5 w-36 sm:w-44">
      {/* Avatar */}
      <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl group-hover:scale-[1.03] active:scale-[0.98] transition-all duration-200">
        {/* Gradient fallback */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colorClass} flex items-center justify-center`}
        >
          <span className="text-white font-black text-xl tracking-tight select-none">
            {getInitials(member.name)}
          </span>
        </div>

        {/* Actual picture */}
        <img
          src={member.picture}
          alt={member.name}
          className="absolute inset-0 w-full h-full object-cover object-top"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />

        {/* Subtle bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* Info */}
      <div className="text-center w-full px-1">
        <p
          className="text-[hsl(181_100%_9%)] font-black text-xs leading-tight truncate"
          title={member.name}
        >
          {member.name}
        </p>
        <p
          className="text-[hsl(181_100%_9%/0.45)] text-[10px] sm:text-[11px] font-medium mt-0.5 truncate italic"
          title={member.role}
        >
          {member.role}
        </p>
      </div>
    </div>
  );
}

export default function CastList({ members = cast }: { members?: CastMember[] }) {
  return (
    <section className="mt-10 mb-2">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <h2 className="text-lg sm:text-xl font-black text-[hsl(181_100%_9%)] tracking-tight uppercase">
              Cast
            </h2>
          </div>
        </div>
      </div>

      {/* Horizontal scroll row */}
      <div
        className="flex gap-4 overflow-x-auto pb-3"
        style={
          {
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          } as React.CSSProperties
        }
      >
        {members.map((member, index) => (
          <CastCard key={member.id} member={member} index={index} />
        ))}
      </div>
    </section>
  );
}
