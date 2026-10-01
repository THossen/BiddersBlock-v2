import { NavLink, Link, useNavigate } from "react-router-dom";
import useAuth from "../../Providers/useAuth";
import AccountCircle from "@mui/icons-material/AccountCircle";

const navLink = ({ isActive }) =>
  `rounded-full px-3 py-2 text-sm font-semibold tracking-wide transition-all ${
    isActive ? "bg-white/10 text-white shadow-inner shadow-white/10" : "text-slate-200 hover:bg-white/5 hover:text-white"
  }`;

const btn =
  "rounded-full px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300";

const NavBar = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="group flex items-center gap-3 text-lg font-black tracking-tight text-white sm:text-xl">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-400 to-indigo-500 text-sm font-black text-slate-950 shadow-[0_8px_20px_rgba(56,189,248,0.45)] ring-2 ring-white/10 transition-transform duration-300 group-hover:scale-105">
            <span className="absolute inset-0 rounded-2xl bg-white/10" />
            <span className="relative">B</span>
          </span>
          <span className="bg-gradient-to-r from-white via-sky-200 to-cyan-300 bg-clip-text text-transparent">
            BiddersBlock
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <NavLink to="/Auctions" className={navLink}>Auctions</NavLink>
          {loading ? null : !user ? (
            <>
              <Link to="/LoginPage" className={`${btn} text-slate-200 hover:bg-white/5 hover:text-white`}>
                Log in
              </Link>
              <Link to="/RegisterPage" className={`${btn} bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 shadow-lg shadow-cyan-500/30 hover:brightness-105`}>
                Sign up
              </Link>
            </>
          ) : (
            <>
              <Link to="/ProfilePage" aria-label="Your profile" className="rounded-full p-2 text-slate-200 transition hover:bg-white/5 hover:text-white">
                <AccountCircle fontSize="large" />
              </Link>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className={`${btn} border border-white/15 bg-white/5 text-white hover:bg-white/10`}
              >
                Log out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
export default NavBar;
