import { NextResponse } from "next/server";
import Organization from "@/models/Organization";
import { getAuth } from '@clerk/nextjs/server';
import  connectDB from "@/lib/mongodb";
import Member from "@/models/Member";


export async function GET(req) {
  try {
    await connectDB();

    // TODO: Replace this with actual auth logic (Clerk, JWT, session, etc.)
    const { userId } = getAuth(req);
    console.log(userId);
    if(!userId){
      return new NextResponse('Unauthorized',{status:401});
    }

    // 1. Organizations created by user
    const createdOrgs = await Organization.find({ createdBy: userId });
    console.log(createdOrgs);

    // 2. Memberships where user is a member
    const memberships = await Member.find({ userID:userId });
    console.log(memberships);
    // 3. Extract organizationIds from memberships
    const orgIdsFromMemberships = memberships.map((m) => m.organizationId);

    // 4. Find organizations where the user is a member (excluding duplicates)
    const memberOrgs = await Organization.find({
      _id: { $in: orgIdsFromMemberships },
    });

    // 5. Merge and remove duplicates
    const allOrgs = [...createdOrgs, ...memberOrgs];
    const uniqueOrgs = Array.from(
      new Map(allOrgs.map((org) => [org._id.toString(), org])).values()
    );

    console.log(uniqueOrgs);

    return NextResponse.json({ uniqueOrgs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

