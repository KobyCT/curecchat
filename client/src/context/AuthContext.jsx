import { useEffect } from "react";
import { createContext, useCallback, useState } from "react";
import { baseUrl, postRequest , getRequest } from "../utils/service";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  console.log("Userr:", user);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getRequest(`${baseUrl}/auth/me`);
        console.log(response.data);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
  
    fetchUser();
  }, []);
  

  return (
    <AuthContext.Provider
      value={{
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
