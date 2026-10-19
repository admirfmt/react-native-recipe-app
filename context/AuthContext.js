import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { loginRequest, registerRequest } from "../api/auth";
import { setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync("authToken");
        if (saved) setToken(saved);
      } catch (e) {
        console.error("Kunde inte läsa token:", e);
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
    setToken(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(signOut); // 401 logout
  }, []);

  const signIn = async (username, password) => {
    const data = await loginRequest(username, password);
    if (!data?.token) throw new Error("Unexpected response from server.");
    await SecureStore.setItemAsync("authToken", data.token);
    setToken(data.token);
  };

  const signUp = async (username, password) => {
    await registerRequest(username, password);
    await signIn(username, password);
  };

  return (
    <AuthContext.Provider
      value={{ token, isSignedIn: !!token, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);