// AuctionContextProvider.js
import { useState, useEffect, createContext, useCallback } from "react";
import axios from "axios";

export const AuctionContext = createContext();

const AuctionContextProvider = ({ children }) => {
  const [auctionData, setAuctionData] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:3001/auctions");
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
