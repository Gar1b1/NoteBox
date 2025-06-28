// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// --- UPDATED: Define the shape of your context data, including the login and logout functions ---
interface AuthContextType {
  currentUserId: string | null;
  login: (userId: string) => void;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// --- UPDATED: Create a provider component that manages its own state ---
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Use state to manage the current user ID
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    // Initialize state from local storage on first render
    localStorage.getItem("user_id")
  );

  // Use useNavigate to programmatically redirect users
  const navigate = useNavigate();

  // --- NEW: Implement the login function ---
  const login = (userId: string) => {
    localStorage.setItem("user_id", userId); // Save the user ID to local storage
    setCurrentUserId(userId); // Update the state
  };

  // --- NEW: Implement the logout function ---
  const logout = () => {
    localStorage.removeItem("user_id"); // Clear the user ID from local storage
    setCurrentUserId(null); // Clear the state
    navigate("/login"); // Redirect the user to the login page
  };

  // The value provided by the context now includes the user ID and the login/logout functions
  const value = {
    currentUserId,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
