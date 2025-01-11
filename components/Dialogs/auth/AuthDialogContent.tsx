"use client";
import Image from "next/image";
import GoogleIcon from "@/assets/icons/google_icon.svg";
import TwitterIcon from "@/assets/icons/twitter_icon.svg";
import { useState } from "react";
import useAuth from "@/hooks/useAuth";

const AuthDialogContent = () => {
  const [referralCode, setReferralCode] = useState("");
  const { isConnecting, signIn } = useAuth();

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
    </div>
  );
};

export default AuthDialogContent;
