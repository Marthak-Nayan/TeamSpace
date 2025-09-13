'use client';

import React, { useState, useEffect } from "react";
import { MeetingControls } from "./MeetingControls";
import { 
  PaginatedGridLayout, 
  useCallStateHooks,
  ParticipantView,
  StreamVideoParticipant,
  SpeakerLayout
} from "@stream-io/video-react-sdk";

const MeetingRoom = () => {
  const { 
    useParticipantCount, 
    useParticipants,
    useLocalParticipant,
    useCameraState,
    useMicrophoneState,
    useHasOngoingScreenShare,
    useScreenShareState
  } = useCallStateHooks();
  
  const participantCount = useParticipantCount();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const { camera, isMuted: isCameraMuted } = useCameraState();
  const { microphone, isMuted: isMicMuted } = useMicrophoneState();
  const hasScreenShare = useHasOngoingScreenShare();
  const { screenShare, isMuted: isScreenShareMuted } = useScreenShareState();

  // Get participants who are sharing screen
  const screenSharingParticipants = participants?.filter(p => p.isScreenSharing) || [];

  // Debug: Check if participants have video tracks and screen sharing
  /*useEffect(() => {
    // console.log('Participants:', participants);
    // console.log('Local participant:', localParticipant);
    // console.log('Camera state:', { camera, isCameraMuted });
    // console.log('Screen share state:', {
    //   hasScreenShare,
    //   isScreenShareMuted,
    //   screenSharingParticipants: screenSharingParticipants.length
    // });
    participants?.forEach((participant, index) => {
      console.log(`Participant ${index}:`, {
        id: participant.userId,
        name: participant.name,
        hasVideo: !!participant.videoStream,
        hasAudio: !!participant.audioStream,
        isLocal: participant.isLocalParticipant,
        isScreenSharing: participant.isScreenSharing
      });
    });
  }, [participants, localParticipant, camera, isCameraMuted, hasScreenShare, screenSharingParticipants]);
*/
  return (
    <section className="min-h-screen flex flex-col relative bg-gray-900 text-white">
      <div className="flex-1 relative pt-10">
        {/* Conditional rendering based on screen share */}
        {hasScreenShare ? (
          // When someone is sharing screen, use SpeakerLayout (prioritizes screen share)
          <SpeakerLayout
            participantsBarPosition="bottom"
            participantsBarLimit={6}
          />
        ) : (
          // When no screen share, show custom grid layout
          <div className="grid grid-cols-2 gap-4 p-4">
            {participants?.map((participant) => (
              <div key={participant.sessionId} className="bg-gray-800 rounded-lg overflow-hidden">
                <ParticipantView
                  participant={participant}
                />
              </div>
            ))}
          </div>
        )}

        {/* Screen share indicator */}
        {hasScreenShare && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-lg text-sm z-10">
            🖥️ Screen sharing active
          </div>
        )}

        {/* Show who is sharing screen */}
        {screenSharingParticipants.length > 0 && (
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm z-10">
            {screenSharingParticipants[0]?.name || 'Someone'} is sharing screen
          </div>
        )}

        {/* Alternative: Custom screen share layout */}
        {/* 
        {hasScreenShare && screenSharingParticipants.length > 0 ? (
          <div className="flex flex-col h-full">
            <div className="flex-1 bg-black rounded-lg m-4">
              <ParticipantView
                participant={screenSharingParticipants[0]}
                className="w-full h-full"
                trackType="screenShareTrack"
              />
            </div>
            <div className="flex gap-2 p-4 overflow-x-auto">
              {participants?.filter(p => !p.isScreenSharing).map((participant) => (
                <div key={participant.sessionId} className="flex-shrink-0 w-32 h-24 bg-gray-800 rounded">
                  <ParticipantView participant={participant} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4">
            {participants?.map((participant) => (
              <div key={participant.sessionId} className="bg-gray-800 rounded-lg overflow-hidden">
                <ParticipantView participant={participant} />
              </div>
            ))}
          </div>
        )}
        */}

        {/* Fallback if no participants 
        {participants?.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-xl mb-4">No participants found</p>
              <p className="text-gray-400">Waiting for others to join...</p>
            </div>
          </div>
        )}*/}
      </div>

      <div className="flex items-center justify-between w-full px-6 py-4 bg-gray-950 border-t border-gray-700">
        <MeetingControls participantCount={participantCount} />
        
        {/* Screen share controls */}
        <ScreenShareControls />
        
        {/* Debug info */}
        <div className="text-xs text-gray-400">
          Participants: {participantCount} | 
          Camera: {isCameraMuted ? 'Off' : 'On'} | 
          Mic: {isMicMuted ? 'Off' : 'On'} |
          Screen Share: {hasScreenShare ? 'Active' : 'Inactive'}
        </div>
      </div>
    </section>
  );
};

// Screen sharing controls component
export const ScreenShareControls = () => {
  const { useScreenShareState } = useCallStateHooks();
  const { screenShare, isMuted, isEnabled } = useScreenShareState();

  const startScreenShare = async () => {
    try {
      await screenShare.enable();
      console.log('Screen sharing started');
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
      alert('Failed to start screen sharing. Please check permissions.');
    }
  };

  const stopScreenShare = async () => {
    try {
      await screenShare.disable();
      console.log('Screen sharing stopped');
    } catch (error) {
      console.error('Failed to stop screen sharing:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isEnabled ? (
        <button 
          onClick={stopScreenShare}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm transition-colors"
        >
          🛑 Stop Sharing
        </button>
      ) : (
        <button 
          onClick={startScreenShare}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm transition-colors"
        >
          🖥️ Share Screen
        </button>
      )}
    </div>
  );
};

export default MeetingRoom;
/*
// Additional troubleshooting component
export const VideoTroubleshooter = () => {
  const { useCall } = useCallStateHooks();
  const call = useCall();

  const checkPermissions = async () => {
    try {
      // Check camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      console.log('Media permissions granted');
      stream.getTracks().forEach(track => track.stop());
      
      // Check if call is properly connected
      console.log('Call state:', call?.state);
      console.log('Call participants:', call?.state.participants);
      
    } catch (error) {
      console.error('Media permission error:', error);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, [call]);

  return null;
};*/