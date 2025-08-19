'use client';

import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {


  return (
    <div className="flex h-screen w-full justify-center items-center">
      <SignIn/>
    </div>
  );
};

export default SignInPage;
