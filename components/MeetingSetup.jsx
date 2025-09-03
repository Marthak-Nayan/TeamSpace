'use client';

import {
  DeviceSettings,
  useCall,
  VideoPreview,
  SpeakingWhileMutedNotification,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
} from "@stream-io/video-react-sdk";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";

const MeetingSetup = ({ setIsSetupComplete }) => {
  const [isMember, setIsMember] = useState(null);
  const { user } = useUser();
  const { id } = useParams();

  const call = useCall();
  if (!call) {
    throw new Error("useCall must be used within a StreamCall component");
  }

  useEffect(() => {
    const checkMembership = async () => {
      try {
        const res = await fetch("/api/organizations/check-member", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user?.id, meetingid: id }),
        });
        const data = await res.json();
        setIsMember(data.isMember);
      } catch (err) {
        console.error("Membership check failed:", err);
        setIsMember(false);
      }
    };

    if (user?.id && id) checkMembership();
  }, [user, id]);

  if (isMember === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        <p className="text-lg font-semibold">Checking access…</p>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        <h1 className="text-xl font-bold">
          You are not authorized to join this meeting.
        </h1>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-gray-900 text-white px-4">
      <h1 className="text-2xl font-bold">Setup your meeting</h1>

      {/* Video Preview */}
      <VideoPreview />

      {/* Built-in Audio/Video Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <SpeakingWhileMutedNotification>
          <ToggleAudioPublishingButton />
        </SpeakingWhileMutedNotification>
        <ToggleVideoPublishingButton />
        <DeviceSettings />
      </div>

      {/* Device Settings */}
      


      {/* Join button */}
      <Button
        className="mt-4 rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold hover:bg-blue-700"
        onClick={() => {
          call.join({ create: false });
          setIsSetupComplete(true);
        }}
      >
        Join Meeting
      </Button>
    </div>
  );
};

export default MeetingSetup;
