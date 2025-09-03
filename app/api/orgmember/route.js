import { NextResponse } from "next/server";
import { getAuth } from '@clerk/nextjs/server';
import  connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import mongoose from "mongoose";
import Organization from "@/models/Organization";


export async function POST(req) {
  try {
    await connectDB();
    const { orgid} = await req.json();
    // TODO: Replace this with actual auth logic (Clerk, JWT, session, etc.)
    const { userId } = getAuth(req);
    console.log(orgid);
    if(!userId){
      return new NextResponse('Unauthorized',{status:401});
    }

    const orgMembers = await Member.find({ organizationId: new mongoose.Types.ObjectId(orgid) });
    //console.log(createdOrgs);

    const orgdescription = await Organization.findById(orgid).select("description").lean();
    const description = orgdescription?.description;

    return NextResponse.json({ members:orgMembers, description }, { status: 200 });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

