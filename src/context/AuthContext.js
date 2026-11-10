// Keeps track of who is logged in, and remembers the login after the app closes.
import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api';

const TOKEN_KEY = 'helmlock_token';
const AuthContext = createContext(null);

// Save the login token safely on the phone
async function saveToken(token) {
  try {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (e) {
    // Secure storage isn't available here (for example on web). The login just won't be remembered.
  }
}

async function readToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true); // true while checking for a saved login

  // When the app opens: log back in with the saved token
  useEffect(() => {
    (async () => {
      const token = await readToken();
      if (token) {
        api.setToken(token);
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (e) {
          api.setToken(null);
          await saveToken(null);
        }
      }
      setBooting(false);
    })();
  }, []);

  async function signIn(email, password) {
    const res = await api.login({ email, password });
    api.setToken(res.token);
    await saveToken(res.token);
    setUser(res.user);
  }

  async function signUp(form) {
    const res = await api.register(form);
    api.setToken(res.token);
    await saveToken(res.token);
    setUser(res.user);
  }

  async function signOut() {
    try {
      await api.logout();
    } catch (e) {
      // Log out on the phone even if the server can't be reached
    }
    api.setToken(null);
    await saveToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, booting, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}