import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { createPlaylist } from "../api/playlists";

const CreatePlaylist: React.FC = () => {
  const { currentUserId } = useAuth();
  const navigate = useNavigate();

  const [newPlaylistName, setNewPlaylistName] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      setCreateError("Playlist name cannot be empty.");
      return;
    }
    if (!currentUserId) {
      setCreateError("User is not logged in.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      // --- ADD THIS LINE FOR DEBUGGING ---
      console.log("Attempting to create playlist with:", {
        creatorId: currentUserId,
        playlistName: newPlaylistName,
      });
      // -----------------------------------
      await createPlaylist(currentUserId, newPlaylistName);
      setNewPlaylistName("");
      setCreateSuccess("Playlist created successfully!");
      // Redirect back to the playlists page after a short delay
      setTimeout(() => {
        navigate("/playlists");
      }, 1500);
    } catch (err: any) {
      console.error("Failed to create playlist:", err);
      // The error message from the backend should be more specific now.
      setCreateError(
        err.message || "Failed to create playlist. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mt-5 text-light">
      <div
        className="card bg-dark text-light p-4 mx-auto"
        style={{ maxWidth: "500px" }}
      >
        <h2 className="mb-4 text-center">Create a New Playlist</h2>
        <form onSubmit={handleCreatePlaylist}>
          <div className="mb-3">
            <label htmlFor="playlistName" className="form-label">
              Playlist Name
            </label>
            <input
              type="text"
              className="form-control bg-secondary text-light border-dark"
              id="playlistName"
              placeholder="Enter playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              disabled={isCreating}
              required
            />
          </div>
          <div className="d-grid gap-2">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Playlist"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/playlists")}
              disabled={isCreating}
            >
              Cancel
            </button>
          </div>
        </form>
        {isCreating && <div className="text-center mt-3">Creating... </div>}
        {createError && (
          <div className="alert alert-danger mt-3">{createError}</div>
        )}
        {createSuccess && (
          <div className="alert alert-success mt-3">{createSuccess}</div>
        )}
      </div>
    </div>
  );
};

export default CreatePlaylist;
