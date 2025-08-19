"use client";
import { createContext, useContext, useState, useEffect } from "react";

const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
  const [selectedOrg, setSelectedOrgState] = useState(null);

  // Set and persist to localStorage
  const setSelectedOrg = (org) => {
    setSelectedOrgState(org);
    if (org) {
      const currentStored = localStorage.getItem("selectedOrg");
      const newValue = JSON.stringify(org);

      // Only update if value has changed

      if (currentStored !== newValue) {
        localStorage.setItem("selectedOrg", newValue);
        setSelectedOrgState(org);
        window.location.reload();
      }
    } else {
      localStorage.removeItem("selectedOrg");
    }
  };

  // Restore from localStorage on first load
  useEffect(() => {
    const storedOrg = localStorage.getItem("selectedOrg");
    if (storedOrg) {
      try {
        setSelectedOrgState(JSON.parse(storedOrg));
      } catch (err) {
        console.error("Invalid selectedOrg in localStorage");
      }
    }
  }, []);

  return (
    <OrganizationContext.Provider value={{ selectedOrg, setSelectedOrg }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganizationClient = () => useContext(OrganizationContext);
