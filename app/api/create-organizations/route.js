import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Organization from "@/models/Organization";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const body = await req.json();
    
    const { orgName, orgEmail, username,description } = body;
    if (!orgName || !orgEmail || !username) {
      return new NextResponse("Please provide org name and email", { status: 400 });
    }

    const newOrg = await Organization.create({
      name: orgName.trim(),
      createdBy: userId,
      OrgMail: orgEmail.toLowerCase().trim(),
      description,
    });

    
    await Member.create({
      name: username,
      userID: userId,
      organizationId: newOrg._id,
      email:orgEmail.toLowerCase().trim(),
      role:"host",
    });
    console.log("Member are join in Organization");

    return NextResponse.json(newOrg, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating org:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
