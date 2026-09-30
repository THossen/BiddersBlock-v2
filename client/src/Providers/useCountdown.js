import { useState, useEffect } from "react";

const format = (ms) => {
  if (ms <= 0) return "Auction ended";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400),
    h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60),
    sec = s % 60;
  return `${d}d ${h}h ${m}m ${sec}s`;
};

const useCountdown = (endTime) => {
  const end = endTime.getTime(); // a number, so the effect doesn't restart on every render
  const [timeLeft, setTimeLeft] = useState(() => format(end - Date.now()));

  useEffect(() => {
    const tick = () => setTimeLeft(format(end - Date.now()));
    tick(); // no blank first second
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [end]);

  return timeLeft;
};

export default useCountdown;
