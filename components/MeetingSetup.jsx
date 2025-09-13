'use client';

import {
  DeviceSettings,
  useCall,
  VideoPreview,
  SpeakingWhileMutedNotification,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  useStreamVideoClient,
} from '@stream-io/video-react-sdk';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useUser } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { useOrganizationClient } from '@/context/OrganizationContext';

const MeetingSetup = ({ setIsSetupComplete }) => {
  const { user } = useUser();
  const { id } = useParams();
  const { selectedOrg } = useOrganizationClient();

  // Hook: stream client
  const client = useStreamVideoClient();
  // Hook: get call from context (provided by <StreamCall>)
  const call = useCall();

  const [isHost, setIsHost] = useState(false);
  const [isMember, setIsMember] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Decide host status
  useEffect(() => {
    if (!user?.id) return;
    // Simple check
    if (user.id === selectedOrg?.createdBy) {
      setIsHost(true);
    } else {
      setIsHost(false);
    }
  }, [user?.id, selectedOrg]);

  console.log('Is host:', isHost);
  // Check membership API
  useEffect(() => {
    const checkMembership = async () => {
      try {
        const res = await fetch('/api/organizations/check-member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.id, meetingid: id }),
        });
        const data = await res.json();
        setIsMember(data.isMember);
      } catch (err) {
        console.error('Membership check failed:', err);
        setIsMember(false);
      }
    };
    if (user?.id && id) checkMembership();
  }, [user?.id, id]);

  // handle join
  // handle join
  // const handleJoinCall = async () => {
  //   if (!call) {
  //     console.error('Call object not available');
  //     return;
  //   }
  //   setIsLoading(true);
  //   try {
  //     await call.join({
  //       create: isHost,
  //       data: {
  //         members: [
  //           {
  //             user_id: user.id,
  //             role: isHost ? 'host' : 'user',
  //           },
  //         ],
  //         /*...(isHost && {
  //           settings_override: {
  //             audio: { 
  //               mic_default_on: true,
  //               default_device: 'default' // Required field
  //             },
  //             video: { 
  //               camera_default_on: true,
  //               target_resolution: {
  //                 width: 640,  // Must be >= 240
  //                 height: 480  // Must be >= 240
  //               }
  //             },
  //             screensharing: { enabled: true },
  //             recording: { mode: 'available' },
  //           },
  //         }),*/
  //       },
  //     });
  //     setIsSetupComplete(true);
  //   } catch (error) {
  //     console.error('Error joining call:', error);
  //     alert('Failed to join the meeting');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // states
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

  if (!call) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        <p className="text-lg font-semibold">Loading call...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-gray-900 text-white px-4">
      <h1 className="text-2xl font-bold">
        Setup your meeting{' '}
        {isHost && <span className="text-green-400">(Host)</span>}
      </h1>

      {/* Camera preview */}
      <VideoPreview />

      {/* Audio/Video toggles */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <SpeakingWhileMutedNotification>
          <ToggleAudioPublishingButton />
        </SpeakingWhileMutedNotification>
        <ToggleVideoPublishingButton />
        <DeviceSettings />
      </div>

      {/* Join button */}
      <Button
        className="mt-4 rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        onClick={() => {
          call.join({
            create: false
          });
          setIsSetupComplete(true);
        }}     
        disabled={isLoading}
      >
        {isLoading
          ? 'Joining…'
          : isHost
          ? 'Start Meeting'
          : 'Join Meeting'}
      </Button>
    </div>
  );
};

export default MeetingSetup;

/*'use client';

import {
  DeviceSettings,
  useCall,
  VideoPreview,
  SpeakingWhileMutedNotification,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";

const MeetingSetup = ({ setIsSetupComplete }) => {
  const [isMember, setIsMember] = useState(null);
  const { user } = useUser();
  const { id } = useParams();

  //const call = useCall();
  // if (!call) {
  //   throw new Error("useCall must be used within a StreamCall component");
  // }
  const [call,setCall] = useState(null);
  const [isHost, setIsHost] = useState(false);
  useEffect(() => {
    const client = useStreamVideoClient();
    setCall(client.call("default", id));
    if (user?.id === call?.createdBy) {
      setIsHost(true);
    }
  }, [id]);

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

      {/* Video Preview * /}
      <VideoPreview />

      {/* Built-in Audio/Video Controls * /}
      <div className="flex items-center justify-center gap-4 mt-4">
        <SpeakingWhileMutedNotification>
          <ToggleAudioPublishingButton />
        </SpeakingWhileMutedNotification>
        <ToggleVideoPublishingButton />
        <DeviceSettings />
      </div>

      {/* Device Settings * /}
      


      {/* Join button * /}
      <Button
        className="mt-4 rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold hover:bg-blue-700"
        onClick={() => {
          call.join({
            data:{
              members: [{ user_id: user.id, role: isHost ? 'host' : 'user' }]
            }
          });
          setIsSetupComplete(true);
        }}
      >
        Join Meeting
      </Button>
    </div>
  );
};

export default MeetingSetup;*/
