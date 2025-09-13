'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Users, Plus, Video, UserCheck } from 'lucide-react';
import { useOrganizationClient } from '@/context/OrganizationContext';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { toast } from 'sonner';

const MeetingSchedulePage = () => {
  // Organization Data
  const { selectedOrg } = useOrganizationClient();
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const client = useStreamVideoClient();

  // Meetings state
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [member, setMember] = useState([]);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
  });

  // Current user object
  const currentUser = {
    id: user?.id,
    name:
      user?.fullName ||
      user?.username ||
      user?.emailAddresses?.[0]?.emailAddress ||
      'Unknown User',
  };

  // Role detection
  const isOrganizationCreator = currentUser.id === selectedOrg?.createdBy;

  // Fetch meetings from database
  const fetchMeetings = async () => {
    if (!selectedOrg?._id) return;
    try {
      setLoading(true);

      const response = await fetch(`/api/meetings?organizationId=${selectedOrg._id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }

      const data = await response.json();
      const validMeetings = (data.meetings || []).filter(meeting =>
        meeting && typeof meeting === 'object' && meeting.scheduledTime
      );
      setMeetings(validMeetings);
      setError('');
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to load meetings');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and setup timer
  useEffect(() => {
    fetchMeetings();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedOrg?._id]);

  useEffect(() => {
    const fetchMemberformOrg = async () => {
      if (!selectedOrg?._id) return;
      const token = await getToken();
      try {
        const res = await fetch("/api/orgmember", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orgid: selectedOrg._id }),
        });

        if (!res.ok) {
          const error = await res.text();
          throw new Error(`Request failed: ${res.status} - ${error}`);
        }

        const data = await res.json();
        setMember(Array.isArray(data.members) ? data.members : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMemberformOrg();
  },[selectedOrg]);

  // Helper function to check if current time is past meeting start time
  const isMeetingTimeActive = (meeting) => {
    if (!meeting || !meeting.scheduledTime) return false;
    try {
      const start = new Date(meeting.scheduledTime);
      const now = new Date();
      return now >= start;
    } catch (error) {
      console.error('Error checking meeting time:', error);
      return false;
    }
  };

  // Helper function to determine meeting state
  const getMeetingState = (meeting) => {
    if (!meeting) return 'invalid';
    
    const isHost = meeting.hostId === currentUser.id;
    const isTimeActive = isMeetingTimeActive(meeting);
    const isStarted = meeting.isStarted;
    const isEnded = meeting.status === 'ended';

    // Meeting has ended
    if (isEnded) return 'ended';
    
    // Meeting time hasn't arrived yet
    if (!isTimeActive) return 'waiting';
    
    // Meeting time is active but not started yet
    if (isTimeActive && !isStarted) {
      return isHost ? 'ready_to_start' : 'waiting_for_host';
    }
    
    // Meeting is live
    if (isStarted && !isEnded) return 'live';
    
    return 'invalid';
  };

  const handleCreateMeeting = async () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsCreating(true);
      const token = await getToken();

      const scheduledDateTime = new Date(`${newMeeting.date}T${newMeeting.time}`);

      // Check if the scheduled time is in the future
      if (scheduledDateTime <= new Date()) {
        toast.error('Please schedule the meeting for a future time');
        return;
      }

      const meetingData = {
        title: newMeeting.title,
        description: newMeeting.description,
        organizationId: selectedOrg._id,
        hostId: currentUser.id,
        creatorName: currentUser.name,
        scheduledTime: scheduledDateTime,
      };

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(meetingData),
      });

      if (!response.ok) {
        let errorMsg = "Failed to create meeting";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error + (errorData.details ? `: ${errorData.details}` : "");
        } catch (e) {
          const text = await response.text();
          errorMsg = text || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      setMeetings(prevMeetings => [...prevMeetings, result.meeting]);

      setNewMeeting({
        title: '',
        description: '',
        date: '',
        time: '',
      });
      setShowCreateForm(false);

      toast.success('Meeting created successfully!');
    } catch (err) {
      console.error('Error creating meeting:', err);
      toast.error(`Failed to create meeting: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
    fetchMeetings();
  };

  const handleStartMeeting = async (meetingId) => {
    const meeting = meetings.find((m) => m && m._id === meetingId);
    const state = getMeetingState(meeting);
    
    if (state !== 'ready_to_start') {
      toast.error('You can only start meetings you created when the scheduled time has arrived.');
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(`/api/meetings/${meetingId}/start`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isStarted: true, status: "live" }),
      });

      if (!response.ok) throw new Error("Failed to update meeting status");

      // Update local state
      setMeetings((prev) =>
        prev.map((m) =>
          m && m._id === meetingId ? { ...m, isStarted: true, status: "live" } : m
        )
      );
      
      toast.success("Meeting started! You can now join as host.");
    } catch (err) {
      console.error("Error starting meeting:", err);
      toast.error(`Failed to start meeting: ${err.message}`);
    }
  };

  const joinAsHost = async (meetingId) => {
    const meeting = meetings.find((m) => m && m._id === meetingId);
    console.log("Joining as host:", meetingId, meeting._id);
    try {
      if (!client) throw new Error("Stream client not initialized");

      const call = client.call('default', meeting._id);
      if (!call) throw new Error('Failed to create meeting');

      /*await call.getOrCreate({
        data: {
          // created_by_id: currentUser.id,
          // starts_at: new Date(meeting.scheduledTime).toISOString(),
          // custom: { description: meeting.description || "Scheduled Meeting" },
          members: member.map(m => ({ user_id: m._id, role: m.role == "host" ? "host" : "user" })),
        },
      });*/
      await call.getOrCreate({
        data: {
          members: member.map(m => ({ user_id: m.userID, role: m.role == "host" ? "host" : "user" })),
        },
      });

      toast.success("Joining meeting as host...");
      router.push(`/meeting/${call.id}`);
    } catch (err) {
      console.error("Error joining as host:", err);
      toast.error(`Failed to join meeting: ${err.message}`);
    }
  };

  const handleJoinMeeting = async (meetingId) => {
    const meeting = meetings.find((m) => m && m._id === meetingId);
    const state = getMeetingState(meeting);
    
    if (state !== 'live') {
      toast.error('Meeting is not currently active or has not been started yet.');
      return;
    }

    try {
      if (!client) throw new Error("Stream client not initialized");

      // const call = client.call('default', meeting._id);
      // if (!call) throw new Error('Failed to create meeting');

      // await call.updateCallMembers({
      //   update_members: [{ user_id: currentUser.id, role: 'user' }],
      // });
      toast.success("Joining meeting...");
      // router.push(`/meeting/${call.id}`);
      router.push(`/meeting/${meeting._id}`);
    } catch (err) {
      console.error('Error joining meeting:', err);
      toast.error(`Failed to join meeting: ${err.message}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } catch {
      return "";
    }
  };

  // Get status badge based on meeting state
  const getStatusBadge = (meeting) => {
    const state = getMeetingState(meeting);
    
    switch (state) {
      case 'live':
        return <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">Live</span>;
      case 'ready_to_start':
        return <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">Ready to Start</span>;
      case 'waiting_for_host':
        return <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">Waiting for Host</span>;
      case 'ended':
        return <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">Ended</span>;
      case 'waiting':
        return <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">Scheduled</span>;
      default:
        return null;
    }
  };

  // Get action button based on user role and meeting state
  const getActionButton = (meeting) => {
    const state = getMeetingState(meeting);
    const isHost = meeting.hostId === currentUser.id;
    const meetingId = meeting._id;

    // Host actions
    if (isOrganizationCreator && isHost) {
      switch (state) {
        case 'ready_to_start':
          return (
            <button
              onClick={() => handleStartMeeting(meetingId)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors animate-pulse"
            >
              <Video className="w-4 h-4" />
              Start Meeting
            </button>
          );
        case 'live':
          return (
            <button
              onClick={() => joinAsHost(meetingId)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              <Video className="w-4 h-4" />
              Join as Host
            </button>
          );
        case 'ended':
          return (
            <button
              disabled
              className="bg-red-300 text-red-600 px-6 py-3 rounded-lg flex items-center gap-2 cursor-not-allowed"
            >
              <Video className="w-4 h-4" />
              Meeting Ended
            </button>
          );
        default:
          return (
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-6 py-3 rounded-lg flex items-center gap-2 cursor-not-allowed"
            >
              <Video className="w-4 h-4" />
              Not Time Yet
            </button>
          );
      }
    }

    // Member actions
    switch (state) {
      case 'live':
        return (
          <button
            onClick={() => handleJoinMeeting(meetingId)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors animate-pulse"
          >
            <Video className="w-4 h-4" />
            Join Meeting
          </button>
        );
      case 'ended':
        return (
          <button
            disabled
            className="bg-red-300 text-red-600 px-6 py-3 rounded-lg flex items-center gap-2 cursor-not-allowed"
          >
            <Video className="w-4 h-4" />
            Meeting Ended
          </button>
        );
      case 'waiting_for_host':
        return (
          <button
            disabled
            className="bg-yellow-300 text-yellow-700 px-6 py-3 rounded-lg flex items-center gap-2 cursor-not-allowed"
          >
            <Video className="w-4 h-4" />
            Waiting for Host
          </button>
        );
      default:
        return (
          <button
            disabled
            className="bg-gray-300 text-gray-500 px-6 py-3 rounded-lg flex items-center gap-2 cursor-not-allowed"
          >
            <Video className="w-4 h-4" />
            Not Started
          </button>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meeting Schedule</h1>
              <p className="text-gray-600">
                {isOrganizationCreator
                  ? `Organization: ${selectedOrg?.name || 'Unknown'}`
                  : `Organization: ${selectedOrg?.name || 'Unknown'} (Member)`}
              </p>
              {error && (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                  {error}
                  <button onClick={fetchMeetings} className="ml-2 underline hover:no-underline">
                    Retry
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Logged in as</div>
                <div className="font-medium text-gray-900">{currentUser.name}</div>
                <div className="text-xs text-gray-500">
                  {isOrganizationCreator ? 'Organization Creator' : 'Member'}
                </div>
              </div>
              {isOrganizationCreator && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Meeting
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Create Meeting Form */}
        {showCreateForm && isOrganizationCreator && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Create New Meeting</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Title</label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter meeting title"
                  disabled={isCreating}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Meeting description (optional)"
                  disabled={isCreating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isCreating}
                  min={new Date().toISOString().split('T')[0]} // Prevent past dates
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={newMeeting.time}
                  onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isCreating}
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button
                  onClick={handleCreateMeeting}
                  disabled={isCreating}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    isCreating ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isCreating ? 'Creating...' : 'Create Meeting'}
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  disabled={isCreating}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Meetings List */}
        <div className="space-y-4">
          {meetings.filter(meeting => meeting && meeting.scheduledTime).map((meeting) => {
            const state = getMeetingState(meeting);
            const isCreatedByCurrentUser = meeting.hostId === currentUser.id;
            const meetingId = meeting._id;
            const isHighlighted = state === 'live' || state === 'ready_to_start';

            return (
              <div key={meetingId} className={`bg-white rounded-lg shadow-sm border p-6 ${isHighlighted ? 'border-green-500 bg-green-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{meeting.title || 'Untitled Meeting'}</h3>
                      {getStatusBadge(meeting)}
                    </div>
                    <p className="text-gray-600 mb-4">{meeting.description || 'No description provided'}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(meeting.scheduledTime)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(meeting.scheduledTime)}
                      </div>
                      <div className="flex items-center gap-1">
                        <UserCheck className="w-4 h-4" />
                        Created by {meeting.creatorName || 'Unknown'}
                        {isCreatedByCurrentUser && <span className="text-blue-600 font-medium">(You)</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {meeting.participants || 0} participants
                      </div>
                    </div>
                  </div>

                  <div className="ml-6">
                    {getActionButton(meeting)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {meetings.length === 0 && !loading && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">No meetings scheduled</h3>
            <p className="text-gray-400">
              {isOrganizationCreator ? "Create your first meeting to get started" : "No meetings have been scheduled yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingSchedulePage;


