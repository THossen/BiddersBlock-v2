import { useContext } from "react";
import { AuctionContext } from "../../../Providers/AuctionContext";
import useAuth from "../../../Providers/useAuth";
import LandingHero from "./LandingHero";
import EndingSoonSection from "./EndingSoonSection";
import HowItWorksSection from "./HowItWorksSection";
import FAQSection from "./FAQSection";

const LandingPage = () => {
  const { auctionData } = useContext(AuctionContext);
  const { user, loading } = useAuth();
  const now = new Date();
  const endingSoon = auctionData
    .filter(
      (auction) =>
        new Date(auction.auctionStartTime) <= now &&
        new Date(auction.auctionEndTime) > now,
    )
    .sort((a, b) => new Date(a.auctionEndTime) - new Date(b.auctionEndTime))
    .slice(0, 3);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-br from-indigo-100 via-sky-100 to-pink-100 blur-3xl" />
      <LandingHero user={user} loading={loading} />
      <EndingSoonSection auctions={endingSoon} />
      <HowItWorksSection />
      <FAQSection />
    </div>
  );
};

export default LandingPage;
