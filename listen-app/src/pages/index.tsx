// src/pages/index.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Import the useAuth hook

/**
 * A simple Home component for the root path of the application.
 * Provides a welcome message and a link to the Songs page.
 */
const Home: React.FC = () => {
  // Use the useAuth hook to get the current user's ID and the logout function
  const { currentUserId, logout } = useAuth();

  return (
    // Updated with Bootstrap dark mode classes
    // bg-dark for dark background, text-light for light text
    // p-5 for increased padding, rounded for rounded corners, shadow for subtle shadow
    <div className="container bg-dark text-light p-5 mt-4 rounded shadow">
      <h2 className="display-4 fw-bold mb-4 text-primary">
        {/* Conditionally display a personalized welcome message */}
        {currentUserId
          ? `Welcome, ${currentUserId}!`
          : "Welcome to Your Music App!"}
      </h2>
      <p className="lead mb-4">
        Discover and play your favorite tunes. Use the navigation bar above to
        explore songs. As the app evolves, you'll be able to manage playlists
        and more!
      </p>
      <div className="mt-4">
        <Link to="/songs" className="btn btn-primary btn-lg me-3">
          Go to Songs
        </Link>
        {/* --- ADDED: Conditionally display a Logout button --- */}
        {currentUserId && (
          <button onClick={logout} className="btn btn-outline-light btn-lg">
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
