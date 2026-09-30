import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-violet-950 text-violet-200">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 sm:flex-row">
      <p className="text-sm">&copy; {new Date().getFullYear()} BiddersBlock. All rights reserved.</p>
      <div className="flex gap-6 text-sm font-medium">
        <Link to="/AboutUs" className="hover:text-white">About us</Link>
        <Link to="/Contact" className="hover:text-white">Contact us</Link>
      </div>
    </div>
  </footer>
);
export default Footer;
