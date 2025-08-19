import { NextResponse } from "next/server";
import Organization from "@/models/Organization";
import  connectDB from "@/lib/mongodb";
import nodemailer from "nodemailer";
import Invitation from "@/models/Invitation";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req) {
    try{
        await connectDB();

        const {orgId,emails,baseUrl} = await req.json();

        if(!orgId || !emails){
            return new NextResponse('Plz Provide all Field Informatoin',{status:401});
        }

        const org = await Organization.findById(orgId);
        if(!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });
        
        const uniqueEmails = [...new Set(emails.map(e => e.trim().toLowerCase()).filter(Boolean))];
        console.log(uniqueEmails);
        const invitations = [];

        for(const email of uniqueEmails){
            const inv = await Invitation.create({ orgId, email, status: "pending", invitedAt: new Date() });

            const inviteLink = `${baseUrl}/accept-invite/${inv._id}`;

            try{
                await transporter.sendMail({
                    from: org.OrgMail,
                    to: email,
                    subject:`You're invited to join ${org.name}`,
                    html:`<p>You've been invited to join <strong>${org.name}</strong>.</p>
                 <p><a href="${inviteLink}">Click here to accept the invitation</a></p>`,
                })
            }catch(error){
                console.error("Mail error for ",email,error);   
            }
            invitations.push(inv);
        }
        return NextResponse.json({ success: true, invitations }, { status: 201 });
    }
    catch(error){
        console.error(err);
            return NextResponse.json({ error: "Server error",err }, { status: 500 });
    }
}