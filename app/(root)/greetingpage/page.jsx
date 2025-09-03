'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';

const MeetingEndGreeting = ({ organizationName = "Your Organization", onRedirect }) => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Call redirect function when countdown reaches 0
          if (onRedirect) {
            onRedirect('/');
          } else {
            // Fallback to window location change
            window.location.href = '/';
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRedirect]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4 animate-pulse" />
        </div>

        {/* Main Message */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Meeting Ended
          </h1>
          
          <div className="text-lg text-gray-600 mb-6">
            Thank you for joining the meeting with
          </div>
          
          <div className="text-2xl font-semibold text-blue-600 mb-8 bg-blue-50 rounded-lg p-4">
            {organizationName}
          </div>

          <div className="text-gray-600 mb-6">
            We hope you had a productive session. You'll be redirected to the meetings page shortly.
          </div>

          <div className="flex items-center justify-center gap-3 text-lg">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">
              Redirecting in 
              <span className="font-bold text-blue-600 mx-2 text-2xl">
                {countdown}
              </span>
              seconds
            </span>
          </div>

          <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((10 - countdown) / 10) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Manual Navigation */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              if (onRedirect) {
                onRedirect('/dashboard');
              } else {
                window.location.href = '/';
              }
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-sm text-gray-500">
          Have feedback about the meeting? Let us know how we can improve your experience.
        </div>
      </div>
    </div>
  );
};

export default MeetingEndGreeting;