// AuctionContextProvider.js
import { useState, useEffect, createContext, useCallback } from "react";
import api from "../api";

export const AuctionContext = createContext();

const AuctionContextProvider = ({ children }) => {
  const [auctionData, setAuctionData] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get("/auctions");
      setAuctionData(response.data.auctions);
    } catch (error) {
      console.error("Error fetching auction data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AuctionContext.Provider value={{ auctionData, setAuctionData, fetchData }}>
      {children}
    </AuctionContext.Provider>
  );
};

export default AuctionContextProvider;
