import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Cookies from "js-cookie";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function copyToClip(field: string) {
  try {
    await navigator.clipboard.writeText(field);
  } catch (err) {
    console.error(err);
  }
}

export function getAccessToken() {
  return typeof window !== undefined
    ? (Cookies.get("access_token") as string)
    : null;
}

export function setLocalToken(key: string, value: string) {
  return typeof window !== undefined ? localStorage.setItem(key, value) : null;
}

export function clearLocalToken() {
  if (typeof window !== undefined) localStorage.removeItem("token");
}
