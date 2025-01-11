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
      "http://localhost:8000/auth/login/google",
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
    const localToken: string | null = getAccessToken();
    if (!localToken) {
      return null;
    }
    const localUser = decodedUser(localToken);
    return localUser;
  }, []);

  useEffect(() => {
    // jwt payload structure
    //   {
    //   "id": number,
    //   "email": string,
    //   "name": string,
    //   "iat": timestamp,
    //   "exp": timestamp,
    // }
    if (token) {
      const user = decodedUser(token);
      setLocalToken("token", token);
      setUser(user);
      toast({
        title: "Successfully logged in",
        // @ts-expect-error jwt
        desc: `Welcome ${user.name}`,
      });
      router.replace("/");
    }
  }, [token]);

  useEffect(() => {
    setUser(checkLocalUser());
  }, []);

  return (
    <AuthContext.Provider value={{ user, isConnecting, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider };
