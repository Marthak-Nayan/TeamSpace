"use client";

import React, { useEffect, useState } from "react";
import { Grid3X3, Users } from "lucide-react";
import {
  CancelCallButton,
  SpeakingWhileMutedNotification,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  CallParticipantsList,
  ScreenShareButton,
  useCallStateHooks,
  useCall,
  CallingState,
} from "@stream-io/video-react-sdk";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Loader from "./Loader";

// Reusable ControlButton
export const ControlButton = ({ icon: Icon, isActive = false, onClick, count = null }) => {
  const baseClasses =
    "flex items-center justify-center p-3 rounded-3xl cursor-pointer transition-all duration-200 relative min-w-12 h-12";

  const getButtonClasses = () =>
    `${baseClasses} ${isActive ? "bg-green-500 hover:bg-green-600" : "bg-gray-600 hover:bg-gray-500"} text-white`;

  return (
    <button className={getButtonClasses()} onClick={onClick}>
      <Icon size={20} />
      {count !== null && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
          {count}
        </span>
      )}
    </button>
  );
};

// Main Controls
export const MeetingControls = ({ participantCount = 1, onChangeLayout }) => {
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState("grid");

  const { useCallCallingState,useLocalParticipant,useRemoteParticipants } = useCallStateHooks();
  const call = useCall();
  const router = useRouter();
  const params = useParams();
  const { getToken } = useAuth();

  const { id } = params;
  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();

  // Redirect if call ended
  useEffect(() => {
  if (callingState === CallingState.LEFT) {
      router.push("/greetingpage");
  }
  }, [callingState, router]);

  if (callingState === CallingState.JOINING) {
    return <Loader message="Joining the meeting..." />;
  }
  if (callingState === CallingState.RECONNECTING) {
    return <Loader message="Reconnecting..." />;
  }

  const handleLeave = async () => {
    try {
      // const response = await call.queryMembers({
      //   payload: { filter_conditions: { role: { $eq: "host" } } },
      // });
      // const admins = response.members || [];
      // console.log("Admins in the call:", admins);
      const result = await call.queryMembers({
        filter_conditions: { role: { $eq: "host" } },
        limit: 1,
      });
      const host = result.members[0];
      console.log("Host of the call:", host.role);
      // Determine if the current user is the host
      
      //const userRole = localParticipant?.role;
      const isHost = host.role === "host";

      if (isHost) {
        const token = await getToken();
        await fetch(`/api/meetings/${id}/end`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            endedAt: new Date().toISOString(),
            status: "ended",
          }),
        });
        call.endCall();
      }
    } catch (err) {
      console.error("Error while leaving/ending call:", err);
    }
  };

  /*const handleChangeLayout = () => {
    const layouts = ["grid", "speaker", "gallery"];
    const currentIndex = layouts.indexOf(layoutMode);
    const newLayout = layouts[(currentIndex + 1) % layouts.length];
    setLayoutMode(newLayout);
    onChangeLayout?.(newLayout);
  };*/

  return (
    <>
      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900 bg-opacity-95 backdrop-blur-sm border-t border-gray-600 flex items-center justify-between px-6 z-50">
        {/* Left: Layout toggle 
        <ControlButton icon={Grid3X3} isActive={layoutMode !== "grid"} onClick={handleChangeLayout} />*/}

        {/* Middle: Custom controls */}
        <div className="flex items-center gap-3">
          <SpeakingWhileMutedNotification>
            <ToggleAudioPublishingButton />
          </SpeakingWhileMutedNotification>
          <ToggleVideoPublishingButton />
          <ScreenShareButton />
          <CancelCallButton onLeave={handleLeave} />
        </div>

        {/* Right: Participants */}
        <ControlButton
          icon={Users}
          isActive={isParticipantsOpen}
          onClick={() => setIsParticipantsOpen(!isParticipantsOpen)}
          count={participantCount}
        />
      </div>

      {/* Participants Panel */}
      {isParticipantsOpen && (
        <div className="absolute right-0 top-0 bottom-20 w-64 bg-gray-800 border-l border-gray-600 shadow-xl z-40 overflow-y-auto">
          <CallParticipantsList />
        </div>
      )}
    </>
  );
};
