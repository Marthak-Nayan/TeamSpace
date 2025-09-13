import connectDB from "@/lib/mongodb";
import Meeting from "@/models/Meeting";
import Member from "@/models/Member";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connectDB();

    const { userId, meetingid } = await req.json();


    const meeting = await Meeting.findById(meetingid).select("organizationId").lean();
    const orgId = meeting?.organizationId;

    if (!userId || !orgId) {
      return new Response(
        JSON.stringify({ error: "userId and orgId are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const member = await Member.findOne({
      userID: userId,
      organizationId: new mongoose.Types.ObjectId(orgId), // convert string → ObjectId
    });


    return new Response(JSON.stringify({ isMember: !!member }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("check-member error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
