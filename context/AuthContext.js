import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { loginRequest, registerRequest, meRequest } from "../api/auth";
import { setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync("authToken");
        if (saved) {
          setToken(saved);
          try {
            setUser(await meRequest(saved));
          } catch (e) {
            console.error("Could not load username:", e);
          }
        }
      } catch (e) {
        console.error("Could not read token:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync("authToken");
    } catch (e) {
      console.error("Could not delete token:", e);
    }
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(signOut); // 401 logout
  }, []);

  const signIn = async (username, password) => {
    const data = await loginRequest(username, password);
    if (!data?.token) throw new Error("Unexpected response from server.");
    await SecureStore.setItemAsync("authToken", data.token);
    try {
      setUser(await meRequest(data.token));
    } catch (e) {
      console.error("Could not load username:", e);
    }
    setToken(data.token);
  };

  const signUp = async (username, password) => {
    await registerRequest(username, password);
    //await signIn(username, password);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, isSignedIn: !!token, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);