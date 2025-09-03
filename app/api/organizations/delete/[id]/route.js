import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Organization from "@/models/Organization";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Meeting from "@/models/Meeting";
import Invitation from "@/models/Invitation";
import Member from "@/models/Member";
import Message from "@/models/Messages";

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    console.log(id);
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const org = await Organization.findById(new mongoose.Types.ObjectId(id));
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (org.createdBy !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await Organization.findByIdAndDelete(id);

    await Meeting.deleteMany({ organizationId: id });
    await Invitation.deleteMany({ orgId: new mongoose.Types.ObjectId(id)});
    await Member.deleteMany({organizationId:new mongoose.Types.ObjectId(id)});
    await Message.deleteMany({organizationId:new mongoose.Types.ObjectId(id)});

    return NextResponse.json({ message: "Organization deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting organization:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
