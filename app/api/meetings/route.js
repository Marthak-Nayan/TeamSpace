// app/api/meetings/route.js

import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import Meeting from "@/models/Meeting";
import connectDB from "@/lib/mongodb";

// GET /api/meetings?organizationId=123
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const meetings = await Meeting.find({ organizationId }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ success: true, meetings });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/meetings
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      title,
      description,
      organizationId,
      creatorName,
      hostId,
      scheduledTime,
    } = body;

    // ✅ validation
    if (!title || !description || !hostId || !creatorName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const meeting = await Meeting.create({
      title,
      description,
      hostId,
      creatorName,
      organizationId,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      participants: [], 
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("POST Meeting Error:", error);
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}
