'use client';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import React from 'react';


const HomeLayout = ({ children }) => {
  return (
    <main className="relative">
      <Navbar/>
      <div className="flex">
        <Sidebar/>
        <section className="flex w-full min-h-screen flex—I flex-col px-6 pb-6 pt-28 max-md: pb—14 sm: px—14">
          <div className="w-full">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
};

export default HomeLayout;
