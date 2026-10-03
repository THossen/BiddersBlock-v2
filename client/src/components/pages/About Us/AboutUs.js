const TEAM = [
  [
    "Tanvir Hossen",
    "Team Lead",
    "Delegated workflow and built features across frontend and backend.",
  ],
  [
    "Isaac Ortega",
    "Backend",
    "Built the service layer and supported the auction infrastructure.",
  ],
  [
    "Robert Chu",
    "Backend",
    "Helped shape the application logic and data flow.",
  ],
  [
    "Darnell Voltaire",
    "Frontend",
    "Focused on the user experience and interface polish.",
  ],
  [
    "Saiyedal Alam",
    "Frontend",
    "Contributed to the interface design and client experience.",
  ],
];

const AboutUs = () => (
  <div className="relative overflow-hidden">
    <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-br from-indigo-100 via-sky-100 to-pink-100 blur-3xl" />

    <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 shadow-sm backdrop-blur">
          Our team
        </span>
        <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
          Built for modern bidding.
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          We combine product thinking, strong engineering, and a focus on smooth
          user experiences to build an auction platform people trust.
        </p>
      </div>

      <ul className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {TEAM.map(([name, role, bio]) => {
          const initials = name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <li
              key={name}
              className="group rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(59,130,246,0.12)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 text-sm font-bold text-white shadow-md shadow-indigo-200">
                  {initials}
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {role}
                </span>
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">{name}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{bio}</p>
            </li>
          );
        })}
      </ul>
    </div>
  </div>
);

export default AboutUs;
