"use client";
import Image from "next/image";
import GoogleIcon from "@/assets/icons/google_icon.svg";
import TwitterIcon from "@/assets/icons/twitter_icon.svg";
import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from 'next/navigation';
import WaitingListPopup from "@/components/waitlist-form";

const AuthDialogContent = () => {
  const router = useRouter();
  const [referralCode, setReferralCode] = useState("");
  const { isConnecting, signIn,user } = useAuth();
  const [showWaitingList, setShowWaitingList] = useState(false)
  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     // Client-side-only code
  //   }
  // }, []);

  useEffect(() => {
    if (user) {
      // Show the popup when the user is logged in
      setShowWaitingList(true);
    }
  }, [user]);

  const signUp = async () => {
    // Implement your signup logic here
    // For example, make an API call to register the user
    console.log("User signed up successfully");
    setShowWaitingList(true)
  };

  const handleSignup = async () => {
    try {
      await signIn(); // Wait for the sign-in process to complete
     
    } catch (error) {
      console.error("Sign-in failed:", error);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2 px-8">
      
      <button
        className="flex items-center justify-between gap-4 rounded-[2px] border bg-white px-2.5 py-2.5 text-xs font-semibold uppercase"
        // onClick={() => signIn()}
        onClick={handleSignup}
        disabled={isConnecting}
      >
        <span>Continue with google</span>
        <Image
          src={GoogleIcon}
          alt="google icon"
          aria-hidden
          width={24}
          height={24}
        />
      </button>
      <WaitingListPopup isOpen={showWaitingList} onClose={() => setShowWaitingList(false)} /> 
    </div>
  );
};

export default AuthDialogContent;
