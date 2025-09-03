'use client';
import MeetingTypeList from '@/components/MeetingTypeList';
import React from 'react'
import CurrentTime from '@/components/CurrentTime';

const home = () => {
  const now = new Date();
  // Full readable date (e.g., Sunday, August 3, 2025)
  const date = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section className="w-full px-2 py-2 text-white">
        
      <div
        className="w-full h-[290px] rounded-[20px] bg-cover bg-center mb-6"
        style={{ backgroundImage: "url('/images/image.jpg')" }}
      >
        <div className="flex h-full w-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-extrabold lg:text-7xl"><CurrentTime/></h1>
            <p className="text-lg font-medium text-sky-100 lg:text-2xl">
              {date}
            </p>
          </div>
        </div>
      </div>
      <MeetingTypeList/>
      
    </section>

  )
}

export default home
