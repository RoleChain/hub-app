"use client";
import Image from "next/image";
import GoogleIcon from "@/assets/icons/google_icon.svg";
import TwitterIcon from "@/assets/icons/twitter_icon.svg";
import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from 'next/navigation';

const AuthDialogContent = () => {
  const router = useRouter();
  const [referralCode, setReferralCode] = useState("");
  const { isConnecting, signIn } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Client-side-only code
    }
  }, []);

  const signUp = async () => {
    // Implement your signup logic here
    // For example, make an API call to register the user
    console.log("User signed up successfully");
  };

  const handleSignup = async () => {
    try {
      // Assume signUp is a function that handles user signup
      await signUp();
      // Redirect to the approval page after successful signup
      router.push('/approval');
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2 px-8">
      {/* <div className="flex flex-col items-center rounded-[2px] border px-2.5 py-2.5 text-xs uppercase">
        <label className="w-full bg-white text-start font-semibold">
          enter referral code (optional)
          <input
            value={referralCode}
            placeholder="00000000"
            onChange={(e) => setReferralCode(e.target.value)}
            className="mt-2 w-full bg-[#F8F8F8] px-4 py-2 font-semibold uppercase tracking-widest focus:outline-border"
            disabled={isConnecting}
          />
        </label>
      </div> */}
      <button
        className="flex items-center justify-between gap-4 rounded-[2px] border bg-white px-2.5 py-2.5 text-xs font-semibold uppercase"
        onClick={() => signIn()}
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
      <button
        className="flex items-center justify-between gap-4 rounded-[2px] border bg-white px-2.5 py-2.5 text-xs font-semibold uppercase"
        onClick={() => signIn()}
        disabled={isConnecting}
      >
        <span>Continue with twitter</span>
        <Image
          src={TwitterIcon}
          alt="twitter icon"
          aria-hidden
          width={24}
          height={24}
        />
      </button>
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
};

export default AuthDialogContent;
