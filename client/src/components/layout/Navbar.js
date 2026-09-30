import { NavLink, Link, useNavigate } from "react-router-dom";
import useAuth from "../../Providers/useAuth";
import AccountCircle from "@mui/icons-material/AccountCircle";

const navLink = ({ isActive }) =>
  `px-3 py-2 text-base font-medium transition-colors ${
    isActive ? "text-white border-b-2 border-cyan-400" : "text-violet-200 hover:text-white"
  }`;
const btn =
  "rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300";

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-violet-950/95 backdrop-blur border-b border-violet-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <img src="/logo.svg" alt="" className="h-9 w-auto" />
          BiddersBlock
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <NavLink to="/Auctions" className={navLink}>Auctions</NavLink>
          {!user ? (
            <>
              <Link to="/LoginPage" className={`${btn} text-white hover:bg-violet-800`}>Log in</Link>
              <Link to="/RegisterPage" className={`${btn} bg-cyan-500 text-violet-950 hover:bg-cyan-400`}>
                Sign up
              </Link>
            </>
          ) : (
            <>
              <Link to="/ProfilePage" aria-label="Your profile" className="text-violet-200 hover:text-white">
                <AccountCircle fontSize="large" />
              </Link>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className={`${btn} border border-violet-600 text-white hover:bg-violet-800`}
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
