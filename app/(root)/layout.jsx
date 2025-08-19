import React from 'react';
import { OrganizationProvider } from "@/context/OrganizationContext";
import StreamVideoProvider from '@/providers/StreamClientProvider';


const RootLayout = ({ children }) => {
  return (
    <main>
      <OrganizationProvider>
        <StreamVideoProvider>
          {children}
        </StreamVideoProvider>
      </OrganizationProvider>
    </main>
  );
};

export default RootLayout;
