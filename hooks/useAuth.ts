import { AuthContext } from "@/contexts/auth.context";
import { useContext } from "react";

const useAuth = () => {
  const authContext = useContext(AuthContext);
  return authContext;
};

export default useAuth;
