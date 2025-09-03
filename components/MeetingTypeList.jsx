'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import HomeCard from './HomeCard';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';
import Loader from './Loader';
import { Textarea } from './ui/textarea';
import ReactDatePicker from 'react-datepicker';
import { toast } from 'sonner'; // ✅ Correct usage
import { Input } from './ui/input';
import MeetingModal from './MeetingModel';
import { useOrganizationClient } from '@/context/OrganizationContext';

const initialValues = {
  dateTime: new Date(),
  description: '',
  link: '',
};

const MeetingTypeList = () => {
  const router = useRouter();
  //const [orgOrclient,setorgOrclient]=('');
  const [meetingState, setMeetingState] = useState(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState();
  const client = useStreamVideoClient();
  const { user } = useUser();
  const [orgId, setOrgId] = useState();
  const { selectedOrg } = useOrganizationClient();

  //set org id
  useEffect(() => {
  if (selectedOrg?._id) {
    setOrgId(selectedOrg._id);
  }
}, [selectedOrg]);

  //get information about user
  const userID = user?.id;

  //check is orgcreator is same as a user or not
  const isOrgCreator = selectedOrg?.createdBy === userID;
  
  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      if (!values.dateTime) {
        toast('Please select a date and time');
        return;
      }
      const id = orgId
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');

      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';

      await call.getOrCreate({
        data: {
          start_By:userID,
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });

      setCallDetail(call);
      
      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }

      toast('Meeting Created');
    } catch (error) {
      console.error(error);
      toast('Failed to create Meeting');
    }
  };

  if (!client || !user) return <Loader />;

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {isOrgCreator && (
      <HomeCard
        img="/icons/add-meeting.svg"
        //title={`${orgOrClient}, Meeting`}
        title="Start Meeting"
        description="Start an instant meeting"
        handleClick={() => setMeetingState('isInstantMeeting')}
      />
      )}
      {!isOrgCreator && (
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="via invitation link"
        className="bg-blue-600"
        handleClick={() => setMeetingState('isJoiningMeeting')}
      />
      )}
      {//isOrgCreator && (
      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule Meeting"
        description="Plan your meeting"
        className="bg-purple-500"
        handleClick={() => router.push('/upcoming')}
      />
      //)
      }
      {/*
      <HomeCard
        img="/icons/recordings.svg"
        title="View Recordings"
        description="Meeting Recordings"
        className="bg-yellow-500"
        handleClick={() => router.push('/recordings')}
      />*/}
      <MeetingModal
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Type the link here"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => router.push(values.link)}
      >
        <Input
          placeholder="Meeting link"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
          className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </MeetingModal>

      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant Meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />
    </section>
  );
};

export default MeetingTypeList;
