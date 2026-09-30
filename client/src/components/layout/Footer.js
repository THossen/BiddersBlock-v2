import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-white/10 bg-slate-950 text-slate-300">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
      <p className="text-sm">&copy; {new Date().getFullYear()} BiddersBlock. All rights reserved.</p>
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/AboutUs" className="transition hover:text-white">About us</Link>
        <Link to="/Contact" className="transition hover:text-white">Contact us</Link>
      </div>
    </div>
  </footer>
);
export default Footer;
