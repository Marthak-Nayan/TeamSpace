/*'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { StreamCall, StreamTheme, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useParams } from 'next/navigation';
import { Loader } from 'lucide-react';

import { useOrganizationClient } from '@/context/OrganizationContext';
import MeetingSetup from '@/components/MeetingSetup';
import MeetingRoom from '@/components/MeetingRoom';

const MeetingPage = () => {
  const params = useParams();
  const id = params.id;

  const { isLoaded, user } = useUser();
  const client = useStreamVideoClient();
  const { selectedOrg } = useOrganizationClient();
  const userId = user?.id;
  console.log(userId, selectedOrg?.createdBy);

  const [call, setCall] = useState(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [loadingCall, setLoadingCall] = useState(true);

  // Create or join the call when client/user available
  useEffect(() => {
    if (!client || !userId || !id) return;

    const initCall = async () => {
      const newCall = client.call('default', id);

      if (!newCall) {
        console.error('Failed to create meeting');
        return;
      }

      if (userId === selectedOrg?.createdBy) {
        console.log("User is host, creating call");
        await newCall.getOrCreate({
          data: {
            created_by_id: userId,
            starts_at: new Date().toISOString(), // or your meeting.scheduledTime
            custom: { description: 'Scheduled Meeting' },
            members: [{ user_id: userId, role: 'host' }],
          },
        });
      } else {
        console.log("User is participant, joining call");
        await newCall.updateCallMembers({
          update_members: [{ user_id: userId, role: 'user' }],
        });
      }

      setCall(newCall);
      setLoadingCall(false);
    };

    initCall();
  }, [client, userId, id, selectedOrg]);

  if (!isLoaded || loadingCall) return <Loader />;

  if (!call) {
    return (
      <p className="text-center text-3xl font-bold text-white">
        Call Not Found
      </p>
    );
  }

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme as="main" className="my-custom-root-class" style={{ position: 'relative'}}>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingPage;*/

"use client";

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { StreamCall, StreamTheme, useCall } from '@stream-io/video-react-sdk';
import { useParams } from 'next/navigation';
import { Loader } from 'lucide-react';

import { useGetCallById } from '@/hooks/useGetCallById';
import MeetingSetup from '@/components/MeetingSetup';
import MeetingRoom from '@/components/MeetingRoom';

const MeetingPage = () => {
  const params = useParams();
  const id = params.id;
  const { isLoaded } = useUser();
  const { call, isCallLoading } = useGetCallById(id);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  if (!isLoaded || isCallLoading) return <Loader />;

  if (!call) {
    return (
      <p className="text-center text-3xl font-bold text-white">
        Call Not Found
      </p>
    );
  }

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme as="main" className="my-custom-root-class" style={{ position: 'relative'}}>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingPage;