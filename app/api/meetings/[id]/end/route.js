import { NextResponse } from "next/server";
import Meeting from "@/models/Meeting";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";

export async function POST(req, { params }) {
  await connectDB();

  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { endedAt, status } = body;

  try {
    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Ensure only host can end
    if (meeting.hostId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update DB
    meeting.status = status;
    meeting.endedAt = endedAt;
    meeting.isStarted="false";
    await meeting.save();

    return NextResponse.json({ success: true, meeting });
  } catch (err) {
    console.error("Error ending meeting:", err);
    return NextResponse.json({ error: "Failed to end meeting" }, { status: 500 });
  }
}
