// Project/app/api/store-retrive-chat/route.js
import connectDB from "@/lib/mongodb";
import Message from "@/models/Messages";
import { NextResponse } from "next/server";

// 📌 GET - Retrieve messages by orgId
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");
  console.log(orgId);
  if (!orgId) {
    return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
  }

  try {
    await connectDB();
    const messages = await Message.find({ organizationId: orgId })
      .sort({ timestamp: 1 }) // Sort by oldest first
      .lean();

    return NextResponse.json(messages);
  } catch (err) {
    console.error("❌ Fetch messages error:", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// 📌 POST - Save a new message
export async function POST(req) {
  try {
    const body = await req.json();
    const { organizationId, userid, mess, username } = body;

    if (!organizationId || !userid || !mess) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();
    const newMessage = await Message.create({
      organizationId,
      userid,
      message: mess,
      username
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (err) {
    console.error("❌ Save message error:", err);
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}
