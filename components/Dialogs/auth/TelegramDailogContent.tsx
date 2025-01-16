"use client";
import Image from "next/image";
import { FaTelegram } from "react-icons/fa";
import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from 'next/navigation';
import { isValidPhoneNumber, getCountries, CountryCode, getCountryCallingCode } from 'libphonenumber-js';

const TelegramDialogContent = () => {
  const router = useRouter();
  const [referralCode, setReferralCode] = useState("");
  const { isConnecting, signIn } = useAuth();
  const [step, setStep] = useState('initial');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('US');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Client-side-only code
    }
  }, []);

  // Get all countries and sort them alphabetically
  const countries = getCountries().sort((a, b) => {
    const nameA = new Intl.DisplayNames(['en'], { type: 'region' }).of(a) || a;
    const nameB = new Intl.DisplayNames(['en'], { type: 'region' }).of(b) || b;
    return nameA.localeCompare(nameB);
  });

  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const signUp = async () => {
    // Implement your signup logic here
    // For example, make an API call to register the user
    console.log("Telegram Connected Successfully");
  };


  const handleTelegramConnect = async () => {
    setStep('phone');
  };

  const handlePhoneSubmit = async () => {
    try {
      // Add your phone verification logic here
      // await verifyPhone(phoneNumber);
      setStep('code');
    } catch (error) {
      console.error("Phone verification failed:", error);
    }
  };

  const handleCodeSubmit = async () => {
    try {
      // Add your code verification logic here
      // await verifyCode(verificationCode);
      router.push('/approval');
    } catch (error) {
      console.error("Code verification failed:", error);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2 px-8">
      {step === 'initial' && (
        <button
          className="flex items-center justify-between gap-4 rounded-[2px] border bg-white px-2.5 py-2.5 text-xs font-semibold uppercase"
          onClick={handleTelegramConnect}
          disabled={isConnecting}
        >
          <span>Continue with Telegram</span>
          <FaTelegram className="h-6 w-6" />
        </button>
      )}

      {step === 'phone' && (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value as CountryCode)}
              className="w-full appearance-none rounded-[2px] border px-4 py-2 text-xs pr-8"
            >
              {countries.map((country) => {
                const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(country);
                const callingCode = getCountryCallingCode(country as CountryCode);
                return (
                  <option key={country} value={country}>
                    {getCountryFlag(country)} {countryName} (+{callingCode})
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          <div className="relative">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                // Allow only numbers and basic phone number characters
                const value = e.target.value.replace(/[^\d+\-() ]/g, '');
                setPhoneNumber(value);
                setPhoneError('');
              }}
              placeholder="Enter phone number"
              className="w-full rounded-[2px] border px-4 py-2 text-xs"
            />
          </div>
          {phoneError && (
            <span className="text-xs text-red-500">{phoneError}</span>
          )}
          <button
            onClick={handlePhoneSubmit}
            className="rounded-[2px] border bg-white px-2.5 py-2.5 text-xs font-semibold uppercase hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50"
            disabled={!phoneNumber || !!phoneError}
          >
            Submit Phone
          </button>
        </div>
      )}

      {step === 'code' && (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
            className="rounded-[2px] border px-4 py-2 text-xs"
          />
          <button
            onClick={handleCodeSubmit}
            className="rounded-[2px] border bg-white px-2.5 py-2.5 text-xs font-semibold uppercase"
          >
            Verify Code
          </button>
        </div>
      )}
    </div>
  );
};

export default TelegramDialogContent;
