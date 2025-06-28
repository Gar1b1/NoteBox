// src/pages/Auth.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Auth: React.FC = () => {
  const [username, setUsername] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    try {
      if (isRegister) {
        // --- LOGIC FOR REGISTRATION (POST request to create a user) ---
        const registerUrl = `${API_BASE_URL}/users`;
        const response = await axios.post(registerUrl, null, {
          params: { user_id: username },
        });

        if (response.status >= 200 && response.status < 300) {
          // --- UPDATED: Use user_id instead of uuid ---
          const userId = response.data.user.user_id;
          if (userId) {
            setMessage("Registration successful!");
            login(userId); // Automatically log them in with their user_id
            navigate("/playlists"); // Redirect them to their playlists
          } else {
            setMessage(
              "Registration failed: User ID not found in the response."
            );
            console.error(
              "API response for registration missing user_id:",
              response.data
            );
          }
        }
      } else {
        // --- LOGIC FOR LOGIN (GET request with a path parameter) ---
        const loginUrl = `${API_BASE_URL}/users/user/${username}`;
        const response = await axios.get(loginUrl);

        if (response.status >= 200 && response.status < 300) {
          // --- UPDATED: Use user_id instead of uuid ---
          const userId = response.data.user.user_id;
          console.log("Login successful! User ID from backend:", userId);

          if (userId) {
            setMessage("Login successful!");
            login(userId); // Use user_id for login
            navigate("/playlists");
          } else {
            setMessage("Login failed: User ID not found in the response.");
            console.error(
              "API response for login missing user_id:",
              response.data
            );
          }
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (isRegister && error.response.status === 409) {
          setMessage("User with that ID already exists. Please log in.");
        } else if (!isRegister && error.response.status === 404) {
          setMessage("User not found. Please register first.");
        } else {
          setMessage(error.response.data.detail || "An error occurred.");
        }
      } else {
        setMessage("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card bg-dark text-light p-4">
            <h2 className="card-title text-center mb-4">
              {isRegister ? "Register" : "Login"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              {message && (
                <div
                  className={`alert ${
                    message.includes("successful")
                      ? "alert-success"
                      : "alert-danger"
                  }`}
                >
                  {message}
                </div>
              )}
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary">
                  {isRegister ? "Register" : "Login"}
                </button>
              </div>
            </form>
            <p className="text-center mt-3">
              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button
                className="btn btn-link p-0"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? "Login" : "Register here"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
