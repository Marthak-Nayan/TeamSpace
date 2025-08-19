"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function OrganizationInfoPage() {
  // Dummy data


    const org = localStorage.getItem("selectedOrg");
    let orgId = "";
    let orgnm= "";
    let orgmail ="";
    let createdBy="";

    try {
      const parsed = JSON.parse(org);
      orgId = parsed?._id || org;
      orgnm = parsed?.name || org;
      orgmail = parsed?.OrgMail || org;
      createdBy = parsed?.createdBy || org;
    } catch{
      orgId = org;
      orgnm = org;
    }
    console.log(org);

    const organization = {
        id: orgId,
        name: orgnm,
        email: orgmail,
        createdAt: "2025-01-15",
        description:
        "Gamma Org is a collaborative platform designed to connect members and facilitate group work with advanced tools.",
        members: [
        { id: 1, name: "Alice Johnson" },
        { id: 2, name: "Bob Smith" },
        { id: 3, name: "Charlie Brown" },
        ],
    };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Organization Header */}
      <Card className="mb-6 shadow-lg border">
        <CardHeader className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/icons/org-logo.png" alt={organization.name} />
            <AvatarFallback>
              {organization.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl font-bold">{organization.name}</CardTitle>
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
            {organization.members.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-3 p-2 border rounded-lg hover:bg-gray-50"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {member.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-800">{member.name}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="default">Edit Organization</Button>
        <Button variant="destructive">Leave Organization</Button>
      </div>
    </div>
  );
}
