"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // for "About"
import { useOrganizationClient } from "@/context/OrganizationContext";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function OrganizationInfoPage() {
  const { selectedOrg,setSelectedOrg,setOrganizations} = useOrganizationClient();
  const [orgMembers, setOrgMembers] = useState([]);
  const [description, setDescription] = useState("");
  const [orgName,setOrgName] = useState("");
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [actionType, setActionType] = useState(null); // "delete" | "edit"
  const [confirmName, setConfirmName] = useState("");

  // Edit dialog state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    if (selectedOrg?.name) {
      setOrgName(selectedOrg.name);
    }
  }, [selectedOrg?.name]);

  useEffect(() => {
    const fetchMemberformOrg = async () => {
      if (!selectedOrg?._id) return;
      const token = await getToken();
      try {
        const res = await fetch("/api/orgmember", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orgid: selectedOrg._id }),
        });

        if (!res.ok) {
          const error = await res.text();
          throw new Error(`Request failed: ${res.status} - ${error}`);
        }

        const data = await res.json();
        setOrgMembers(Array.isArray(data.members) ? data.members : []);
        setDescription(data.description || "");
        setEditDescription(data.description || "");
        setEditName(selectedOrg.name || "");
      } catch (err) {
        console.error(err);
      }
    };
    fetchMemberformOrg();
  }, [selectedOrg?._id]);

  if (!selectedOrg) return null;

  const organization = {
    id: selectedOrg._id,
    name: selectedOrg.name,
    email: selectedOrg.OrgMail,
    createdAt: selectedOrg.createdAt,
    description: description,
    members: orgMembers,
  };

  /*useEffect(() => {
    if (organization.name) {
      setOrgName(organization.name);
    }
  }, [organization.name]);*/

  
  
  


  const handleDeleteOrg = async (orgId) => {
    const token = await getToken();
    try {
      const res = await fetch(`/api/organizations/delete/${orgId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete organization");
      }

      toast("Organization deleted successfully");
      setOrganizations((prev) =>
        prev.filter((org) => org._id !== orgId)
      );
      setSelectedOrg((prev) => (prev?._id === orgId ? null : prev));
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  // ✏️ Update Organization (PATCH)
  const handleUpdateOrg = async (orgId) => {
    const token = await getToken();
    try {
      const res = await fetch(`/api/organizations/update/${orgId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update organization");
      }

      
      toast("Organization updated successfully");
      setDescription(editDescription);
      setOrgName(editName);
      setOrganizations((prev) =>
        prev.map((org) =>
          org._id === orgId ? { ...org, name: editName, description: editDescription } : org
        )
      );
      setSelectedOrg((prev) => ({
        ...prev,
        name: editName,
        description: editDescription,
      }));

      setOpenEditDialog(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Confirm action (delete only)
  const handleConfirmAction = async () => {
    if (confirmName !== organization.name) return;
    if (actionType === "delete") {
      await handleDeleteOrg(organization.id);
    }
    setOpenDialog(false);
    setConfirmName("");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Organization Header */}
      <Card className="mb-6 shadow-lg border">
        <CardHeader className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage alt={organization.name} />
            <AvatarFallback>
              {orgName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl font-bold">
              {orgName}
            </CardTitle>
            <p className="text-gray-500">{organization.email}</p>
            <p className="text-sm text-gray-400">
              Created on {new Date(organization.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Description */}
      <Card className="mb-6 border shadow-sm">
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{organization.description}</p>
        </CardContent>
      </Card>

      {/* Members */}
      <Card className="mb-6 border shadow-sm">
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {Array.isArray(organization.members) &&
              organization.members.map((member) => (
                <li
                  key={member._id}
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-800">{member.name}</span>
                  </div>
                  <span className="text-sm text-gray-500 capitalize">
                    {member.role}
                  </span>
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>


      {/* Actions */}
      {selectedOrg?.createdBy === user?.id && (
        <div className="flex gap-3">
          <Button
            variant="default"
            onClick={() => setOpenEditDialog(true)}
          >
            Edit Organization
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setActionType("delete");
              setOpenDialog(true);
            }}
          >
            Delete Organization
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 mb-3">
            Please type <span className="font-semibold">{organization.name}</span>{" "}
            to confirm.
          </p>
          <Input
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder="Type organization name"
          />
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmAction}
              disabled={confirmName !== organization.name}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Organization Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">About</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Organization description"
              />
            </div>
          </div>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleUpdateOrg(organization.id)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
