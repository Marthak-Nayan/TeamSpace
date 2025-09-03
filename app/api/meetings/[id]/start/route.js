import { NextResponse } from "next/server";
import Meeting from "@/models/Meeting";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";

export async function PATCH(req, { params }) {
  await connectDB();
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Ensure only creator can start
    if (meeting.hostId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update DB
    meeting.isStarted = true;
    meeting.status = "live";
    await meeting.save();

    return NextResponse.json({ success: true, meeting });
  } catch (err) {
    console.error("Error starting meeting:", err);
    return NextResponse.json(
      { error: "Failed to start meeting" },
      { status: 500 }
    );
  }
}
