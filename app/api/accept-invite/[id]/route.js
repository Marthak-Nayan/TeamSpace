// pages/api/accept-invite/[id].js or app/api/accept-invite/[id]/route.js (Next.js 13+)

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb"; // Your DB connection helper
import Invitation from "@/models/Invitation"; // Mongoose model for Invitation
import Member from "@/models/Member"; // Mongoose model for org members or users

export async function POST(req, { params }) {
  await connectDB();

  const { id } = await params; // invitation ID from URL
  const { userId, name, email } = await req.json();

  if (!userId || !email) {
    return NextResponse.json({ success: false, error: "Missing user data" }, { status: 400 });
  }

  try {
    // Find invitation by ID and check status
    const invitation = await Invitation.findById(id);
    if (!invitation) {
      return NextResponse.json({ success: false, error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.status !== "pending") {
      return NextResponse.json({ success: false, error: "Invitation already responded" }, { status: 400 });
    }

    // Mark invitation as accepted
    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    invitation.acceptedBy = userId; // optional field for tracking
    await invitation.save();

    // Add user as member to the organization
    // You may want to check if user is already a member
    const existingMember = await Member.findOne({ orgId: invitation.orgId, userId });

    if (!existingMember) {
      const newMember = new Member({
        organizationId: invitation.orgId,
        userID:userId,
        name,
        email,
        joinedAt: new Date(),
      });
      await newMember.save();
    }

    return NextResponse.json({ success: true, orgId: invitation.orgId });
  } catch (error) {
    console.error("Error accepting invite:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
