// app/api/meetings/route.js

import { NextResponse } from "next/server";
import { getAuth } from '@clerk/nextjs/server';

export async function GET(req) {
  try {

    const { userId } = getAuth(req);

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }


    const meetings = "";
    
    return NextResponse.json({ meetings: filteredMeetings });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
