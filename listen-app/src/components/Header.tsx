// src/components/Header.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";


const Header: React.FC = () => {
  const { currentUserId, logout } = useAuth();

  return (
    <header
      className="bg-dark text-light p-3"
      style={{
        height: HEADER_HEIGHT,
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1050,
      }}
    >
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand fs-3 fw-bold" to="/">
            🎵 NoteBox
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-center">
              <li className="nav-item">
                <Link className="nav-link fs-5" to="/">
                  Home
                </Link>
              </li>
              {currentUserId && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link fs-5" to="/songs">
                      Songs
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link fs-5" to="/artists">
                      Artists
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link fs-5" to="/playlists">
                      Playlists
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link fs-5" to="/upload">
                      Upload
                    </Link>
                  </li>
                </>
              )}
            </ul>
            <ul className="navbar-nav align-items-center">
              {currentUserId ? (
                <li className="nav-item">
                  <button className="btn btn-outline-danger" onClick={logout}>
                    Logout
                  </button>
                </li>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link fs-5" to="/login">
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link fs-5" to="/register">
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
export const HEADER_HEIGHT = "80px";
