import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Configure axios to send cookies with every request
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

// This URL now matches your server.js configuration
const API_URL = 'http://localhost:8000/apis/lost-and-found/auth';

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState('loading'); // loading, unauthenticated, pending-verification, authenticated
  const [userEmail, setUserEmail] = useState(null);

  // Check if user is already logged in when the app loads
  useEffect(() => {
    const validateUser = async () => {
      try {
        await axios.post(`${API_URL}/validate`);
        setAuthState('authenticated');
      } catch (error) {
        setAuthState('unauthenticated');
      }
    };
    validateUser();
  }, []);

  const signup = async (fullName, email, password) => {
    // Note: Your backend doesn't seem to use fullName yet, but we pass it for future use.
    await axios.post(`${API_URL}/signup`, { email, password, fullName });
    setUserEmail(email);
    setAuthState('pending-verification');
  };

  const verifyOtp = async (otp) => {
    await axios.post(`${API_URL}/otp_verification`, { email: userEmail, otp });
    setAuthState('authenticated');
  };

  const login = async (email, password) => {
    await axios.post(`${API_URL}/signin`, { email, password });
    setUserEmail(email);
    setAuthState('authenticated');
  };

  const logout = async () => {
    await axios.post(`${API_URL}/sign-out`);
    setUserEmail(null);
    setAuthState('unauthenticated');
  };

  const value = {
    authState,
    userEmail,
    isAuthenticated: authState === 'authenticated',
    signup,
    verifyOtp,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
