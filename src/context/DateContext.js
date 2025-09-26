// Enhanced DateContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const DateContext = createContext();

export function DateProvider({ children }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    // Priority: URL params > localStorage > null
    const urlParams = new URLSearchParams(window.location.search);
    const urlDate = urlParams.get("date");
    if (urlDate) return urlDate;
    
    const savedDate = localStorage.getItem("selectedDate");
    return savedDate ? JSON.parse(savedDate) : null;
  });

  const [dateRange, setDateRange] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const startDate = urlParams.get("startDate");
    const endDate = urlParams.get("endDate");
    
    if (startDate || endDate) {
      return { start: startDate, end: endDate };
    }
    
    const savedRange = localStorage.getItem("dateRange");
    return savedRange ? JSON.parse(savedRange) : { start: null, end: null };
  });

  // Persist to localStorage
  useEffect(() => {
    if (selectedDate) {
      localStorage.setItem("selectedDate", JSON.stringify(selectedDate));
    } else {
      localStorage.removeItem("selectedDate");
    }
  }, [selectedDate]);

  useEffect(() => {
    if (dateRange.start || dateRange.end) {
      localStorage.setItem("dateRange", JSON.stringify(dateRange));
    } else {
      localStorage.removeItem("dateRange");
    }
  }, [dateRange]);

  return (
    <DateContext.Provider
      value={{ selectedDate, setSelectedDate, dateRange, setDateRange }}
    >
      {children}
    </DateContext.Provider>
  );
}

export function useDate() {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error("useDate must be used within a DateProvider");
  }
  return context;
}