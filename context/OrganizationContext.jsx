"use client";
import { createContext, useContext, useState, useEffect } from "react";

const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
  const [selectedOrg, setSelectedOrg] = useState(null);  
  const [organizations, setOrganizations] = useState([]);


  return (
    <OrganizationContext.Provider value={{ selectedOrg, setSelectedOrg,organizations, setOrganizations }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganizationClient = () => useContext(OrganizationContext);
