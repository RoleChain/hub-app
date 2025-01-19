"use client";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useEffect, useState } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { clearLocalToken, getAccessToken, setLocalToken } from "@/lib/utils";

export type TUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  picture: string;
  stats?: {
    contributions: number;
    reaiEarned: number;
  };
  tokenExpired?: boolean;
};

type AuthContextType = {
  user: TUser | null;
  isConnecting: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isConnecting: false,
  signIn: async () => {},
  signOut: async () => {},
});

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState<TUser | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const decodedUser = (token: string): TUser => {
    const decodedToken = jwtDecode<JwtPayload>(token as string);
    return {
      // @ts-expect-error jwt
      id: decodedToken.id,
      // @ts-expect-error jwt
      email: decodedToken.email,
      // @ts-expect-error jwt
      first_name: decodedToken.first_name,
      // @ts-expect-error jwt
      last_name: decodedToken.last_name,
      // @ts-expect-error jwt
      picture: decodedToken.picture,
      // @ts-expect-error jwt
      tokenExpired: decodedToken.exp * 1000 < Date.now(),
    };
  };
  const signIn = async () => {
    setIsConnecting(true);
    router.push(
      //   // "https://research-ai-backend-production.up.railway.app/auth/google",
      "https://api.rolechaing.org/auth/google",
    );
    setIsConnecting(false);
  };

  const signOut = async () => {
    setIsConnecting(true);
    await fetch(
      "https://research-ai-backend-production.up.railway.app/auth/logout",
    );
    setUser(null);
    clearLocalToken();
    toast({
      title: "Successfully logged out",
      variant: "destructive",
    });
    setIsConnecting(false);
  };

  const checkLocalUser = useCallback(() => {
    const localToken: string | null = localStorage.getItem("token");
    if (!localToken) {
      return;
    }
    // Fetch latest user data using the stored token
    fetch("https://api.rolechaing.org/auth/me", {
      headers: {
        Authorization: `Bearer ${localToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        clearLocalToken();
        setUser(null);
      });
  }, []);

  useEffect(() => {
    if (token) {
      setLocalToken("token", token);
      
      fetch("https://api.rolechaing.org/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          toast({
            title: "Successfully logged in",
          });
          router.replace("/");
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          toast({
            title: "Error fetching user data",
            variant: "destructive",
          });
        });
    }
  }, [token]);

  useEffect(() => {
    checkLocalUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isConnecting, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider };
