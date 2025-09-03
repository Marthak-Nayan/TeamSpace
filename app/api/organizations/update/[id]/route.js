import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Organization from "@/models/Organization";
import { getAuth } from "@clerk/nextjs/server";

export async function PATCH(req, { params }) {
  const { id } = await params;
  const { userId } = getAuth(req);
  const body = await req.json();

  const org = await Organization.findById(id);
  if (!org) return new Response("Not found", { status: 404 });
  if (org.createdBy !== userId)
    return new Response("Unauthorized", { status: 403 });

  org.name = body.name || org.name;
  org.description = body.description || org.description;

  await org.save();

  return Response.json({ message: "Organization updated successfully", org });
}
