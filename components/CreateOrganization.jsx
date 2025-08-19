"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const CreateOrganization = ({ open, setOpen, setOrganizations, setSelectedOrg, organizations }) => {
  const { getToken } = useAuth();
  const [step, setStep] = useState(1);
  //const [orgEmail,setOrgEmail] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const {user,isLoaded} = useUser()


  // Reset all when dialog closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setNewOrgName("");
      setEmailInput("");
    }
  }, [open]);

  const handleCreateOrganization = useCallback(async () => {
    try {
      const token = await getToken();

      const username = user?.username || `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

      console.log(username);
      // Step 1: Create organization
      const orgRes = await fetch("/api/create-organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orgName: newOrgName,
          orgEmail :user.primaryEmailAddress?.emailAddress, // must be defined, not undefined,
          username,
        }),
      });


      if (!orgRes.ok) throw new Error("Failed to create organization");
      const orgData = await orgRes.json();

      // Step 2: Parse multiple emails
      const emails = emailInput
        .split(/[\s,]+/) // split by space or comma
        .map(e => e.trim())
        .filter(e => e); // remove empty entries

      // Step 3: Send invitations
      if (emails.length > 0) {
        await fetch("/api/send-invitations", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ orgId: orgData._id, emails,baseUrl: window.location.origin}),
        });
      }

      setOrganizations([...organizations, orgData]);
      setSelectedOrg(orgData);
      setOpen(false); // close dialog
    } catch (err) {
      console.error("❌ Error creating organization:", err.message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-gray-900 text-white p-6 rounded-lg max-w-lg">
        {step === 1 && (
          <>
            <DialogTitle>Create New Organization</DialogTitle>
            <Input
              className="bg-gray-800 text-white border-gray-600 mt-3"
              placeholder="Enter Organization Name"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              required
            />
            {/*<Input
              className="bg-gray-800 text-white border-gray-600 mt-3"
              placeholder="Enter Your Email"
              value={orgEmail}
              onChange={(e) => setOrgEmail(e.target.value)}
              required
              type="email"
            />*/}
            <div className="flex justify-end mt-4">
              <Button onClick={() => setStep(2)}
                disabled={!newOrgName.trim()} >Next</Button>{ /*|| !orgEmail.trim()} >Next</Button>*/}
            </div>
          </> 
        )}

        {step === 2 && (
          <>
            <DialogTitle>Invite Members</DialogTitle>
            <Input
              className="bg-gray-800 text-white border-gray-600 mt-2"
              placeholder="Enter Email Addresses (separated by space or comma)"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
            <div className="flex justify-between mt-4">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleCreateOrganization}>Create & Send Invites</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrganization;
