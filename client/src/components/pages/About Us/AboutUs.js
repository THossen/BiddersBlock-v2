const TEAM = [
  ["Tanvir Hossen", "Team lead. Assigned the work and built across frontend and backend."],
  ["Isaac Ortega", "Backend."],
  ["Robert Chu", "Backend."],
  ["Darnell Voltaire", "Frontend."],
  ["Saiyedal Alam", "Frontend."],
];

const AboutUs = () => (
  <div className="mx-auto max-w-3xl px-4 py-12">
    <h1 className="text-3xl font-bold text-slate-900">Meet the team</h1>
    <ul className="mt-8 grid gap-4 sm:grid-cols-2">
      {TEAM.map(([name, bio]) => (
        <li key={name} className="rounded-xl border border-slate-200 bg-white p-5 ">
          <h2 className="font-semibold text-slate-900">{name}</h2>
          <p className="mt-1 text-sm text-slate-600">{bio}</p>
        </li>
      ))}
    </ul>
  </div>
);
export default AboutUs;
