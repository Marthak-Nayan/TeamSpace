'use client';

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import MobileNav from './MobileNav'
import { useRouter } from 'next/navigation'
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from '@clerk/nextjs'
import SelectOrganization from './SelectOrganization';

const Navbar = () => {
  const router = useRouter();
  return (
    <nav className="flex items-center justify-between fixed z-50 w-full bg-[#222733] px-6 py-4 lg:px-10">
      {/* Left side: Logo + Title + Select */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/icons/logo.svg"
            height={32}
            width={32}
            alt="TeamSpace logo"
            className="max-sm:w-10 max-sm:h-10"
          />
          <p className="text-[26px] font-extrabold text-white max-sm:hidden">
            TeamSpace
          </p>
        </Link>
          <SelectOrganization />
      </div>
      
      <div className="flex-between gap-5">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <MobileNav />
      </div>
    </nav>
  )
}

export default Navbar
