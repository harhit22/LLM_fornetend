
import React, { createContext, useContext, useState, useEffect } from "react";

const CityContext = createContext();

export function CityProvider({ children }) {
  const [selectedCity, setSelectedCity] = useState(() => {
    // Priority: URL params > localStorage > null
    const urlParams = new URLSearchParams(window.location.search);
    const urlCity = urlParams.get("city");
    if (urlCity) {
      return { city: urlCity, name: urlCity }; // Adjust based on your city object structure
    }
    
    const savedCity = localStorage.getItem("selectedCity");
    return savedCity ? JSON.parse(savedCity) : null;
  });

  useEffect(() => {
    if (selectedCity) {
      localStorage.setItem("selectedCity", JSON.stringify(selectedCity));
    } else {
      localStorage.removeItem("selectedCity");
    }
  }, [selectedCity]);

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error("useCity must be used within a CityProvider");
  }
  return context;
}