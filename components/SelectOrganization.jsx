"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useOrganizationClient } from "@/context/OrganizationContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import CreateOrganization from "./CreateOrganization";

const SelectOrganization = () => {
  const { getToken } = useAuth(); 
  const { selectedOrg, setSelectedOrg } = useOrganizationClient();
  const [ organizations, setOrganizations] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const token = await getToken();

        const res = await fetch("/api/organizations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const error = await res.text();
          throw new Error(`Request failed: ${res.status} - ${error}`);
        }

        const data = await res.json();
        setOrganizations(data.uniqueOrgs || []);
      } catch (err) {
        console.error("❌ Failed to fetch organizations:", err.message);
      }
    };
    fetchOrganizations();
  }, [getToken]);

  const handleSelectChange =(value) => {
    if(value == "createNewOrg"){
        setOpenDialog(true);
    }else{
      const org = organizations.find((org) => org._id === value);
      setSelectedOrg(org || null);
    }
  };

  return (
    <div className="flex flex-col gap-2 text-white ">
      <Select
      value={selectedOrg?._id || ""}
      onValueChange={handleSelectChange}
    >
      <SelectTrigger className="w-[160px] bg-gray-800 text-white border border-gray-600">
        <SelectValue placeholder="Create Organization" />
      </SelectTrigger>

      <SelectContent>
        {organizations.map((org) => (
          <SelectItem key={org._id} value={org._id}>
            {org.name}
          </SelectItem>
        ))}
        <SelectItem key="createNewOrg" value="createNewOrg">
          Create a New Organization
        </SelectItem>
      </SelectContent>
    </Select>
    <CreateOrganization
        open={openDialog}
        setOpen={setOpenDialog}
        setOrganizations={setOrganizations}
        setSelectedOrg={setSelectedOrg}
        organizations={organizations}
      />
    </div>
  );
};

export default SelectOrganization;
