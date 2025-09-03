"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AcceptInvitePage() {
  const { id } = useParams(); // <-- matches [id] in route folder
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState("Checking login...");

  useEffect(() => {
    if (!isLoaded) return;
    //sentRef.current = true;

    // If not logged in → send to sign-in and return here
    if (!userId) {
      const redirectUrl = `/accept-invite/${id}`;
      router.push(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    // If logged in → accept invite
    if (!user) return;

    const acceptInvite = async () => {
      setStatus("Accepting invitation...");

      const res = await fetch(`/api/accept-invite/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          email: user.primaryEmailAddress?.emailAddress
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("Invitation accepted ✅");
        router.push(`/`);
      } else {
        setStatus(`Failed: ${data.error || data.message || "Unknown error"}`);
        setTimeout(() => router.push("/"), 20000);
      }
    };

    acceptInvite();
  }, [isLoaded, userId, user, id]);

  return <div className="p-6 text-center text-white">{status}</div>;
}