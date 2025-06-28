// src/App.tsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Songs from "./pages/Songs";
import Home from "./pages/index";
import UploadSong from "./pages/UploadSong";
import Artists from "./pages/Artists";
import CreateArtist from "./pages/CreateArtist";
import ArtistSongs from "./pages/ArtistSongs";
import Auth from "./pages/Auth";
import Playlists from "./pages/Playlists";
import CreatePlaylist from "./pages/CreatePlaylist";

import Header, { HEADER_HEIGHT } from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

import {
  AudioPlayerProvider,
  useAudioPlayerContext,
} from "./contexts/AudioPlayerContext";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { formatTime } from "./utils";
import Queue from "./components/Queue";

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

function AppContent() {
  const { currentUserId } = useAuth();
  const {
    playingId,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    currentSong,
    playPauseSong,
    onSeekChange,
    onSeekMouseDown,
    onSeekMouseUp,
    onVolumeChange,
    toggleMute,
    queue,
    playNextInQueue,
  } = useAudioPlayerContext();

  const windowWidth = useWindowWidth();
  const playerHeight = "100px";

  const showQueueSidebar = windowWidth >= 768;
  const rightSidebarWidth = showQueueSidebar && currentUserId ? "20vw" : "0";
  const mainContentPaddingBottom = currentUserId ? playerHeight : "0px";

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />

      <div
        className="d-flex flex-grow-1"
        style={{
          paddingTop: HEADER_HEIGHT,
          paddingBottom: mainContentPaddingBottom,
          marginRight: rightSidebarWidth,
          transition: "margin-right 0.3s ease",
        }}
      >
        <main className="bg-dark text-light flex-grow-1 p-4">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route
              path="/songs"
              element={
                <ProtectedRoute>
                  <Songs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadSong />
                </ProtectedRoute>
              }
            />
            <Route
              path="/artists"
              element={
                <ProtectedRoute>
                  <Artists />
                </ProtectedRoute>
              }
            />
            <Route
              path="/artists/create"
              element={
                <ProtectedRoute>
                  <CreateArtist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/artists/:artistName/songs"
              element={
                <ProtectedRoute>
                  <ArtistSongs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playlists"
              element={
                <ProtectedRoute>
                  <Playlists />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playlists/create"
              element={
                <ProtectedRoute>
                  <CreatePlaylist />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {showQueueSidebar && currentUserId && <Queue />}
      </div>

      {currentUserId && (
        <div
          className="bg-secondary text-light p-3 d-flex align-items-center"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            zIndex: 1040,
            height: playerHeight,
            boxShadow: "0 -2px 10px rgba(0,0,0,0.5)",
            paddingLeft: "15px",
          }}
        >
          <div className="flex-grow-1 me-3">
            <div className="fw-bold fs-6">
              Now Playing:{" "}
              {currentSong
                ? `${currentSong.name} - ${currentSong.artist}`
                : "No song playing"}
            </div>

            <input
              type="range"
              min={0}
              max={duration || 0}
              value={Number(progress.toFixed(2))}
              step={0.1}
              onChange={onSeekChange}
              onMouseDown={onSeekMouseDown}
              onMouseUp={onSeekMouseUp}
              className="form-range my-1"
              style={{ width: "100%", cursor: "pointer" }}
              disabled={!currentSong}
            />

            <div className="d-flex justify-content-between small text-light">
              <small>{formatTime(progress)}</small>
              <small>{formatTime(duration)}</small>
            </div>
          </div>

          <div className="d-flex align-items-center me-3">
            <button
              className="btn btn-success me-3"
              onClick={() => {
                if (currentSong) playPauseSong(currentSong.uuid);
              }}
              style={{ width: "80px", height: "40px", flexShrink: 0 }}
              disabled={!currentSong}
            >
              {isPlaying ? "⏸️ Pause" : "▶️ Play"}
            </button>

            <button
              className="btn btn-outline-info me-3"
              onClick={playNextInQueue}
              disabled={queue.length === 0}
              style={{ width: "80px", height: "40px", flexShrink: 0 }}
              title="Play Next Song"
            >
              ⏭️ Next
            </button>

            <div className="d-flex align-items-center">
              <button
                className="btn btn-sm btn-outline-light me-2 p-0 border-0"
                onClick={toggleMute}
                title={isMuted ? "Unmute" : "Mute"}
                disabled={!currentSong}
              >
                {isMuted || volume === 0 ? "🔇" : "🔊"}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={onVolumeChange}
                className="form-range"
                style={{ width: "100px", cursor: "pointer" }}
                disabled={!currentSong}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-bs-theme", "dark");
    localStorage.setItem("theme", "dark");
  }, []);

  return (
    <Router>
      <AudioPlayerProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </AudioPlayerProvider>
    </Router>
  );
}

export default App;
