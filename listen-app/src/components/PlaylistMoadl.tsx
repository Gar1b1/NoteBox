// src/components/PlaylistModal.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchUserPlaylists, addSongToPlaylist } from "../api/playlists";
import { useAuth } from "../contexts/AuthContext";
import type { Song } from "../types";
import type { Playlist } from "../types";

interface PlaylistModalProps {
  song: Song | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({
  song,
  onClose,
  onSuccess,
  onError,
}) => {
  const { currentUserId } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingSong, setAddingSong] = useState(false);

  useEffect(() => {
    const getPlaylists = async () => {
      if (!currentUserId) {
        // This case shouldn't happen if the modal is only shown to logged-in users,
        // but it's a good safeguard.
        onError("You must be logged in to see your playlists.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Use the new fetchUserPlaylists function
        const userPlaylists = await fetchUserPlaylists(currentUserId);
        setPlaylists(userPlaylists);
      } catch (err) {
        console.error("Failed to fetch playlists:", err);
        onError("Failed to load your playlists. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    getPlaylists();
  }, [currentUserId, onError]);

  const handleAddToPlaylist = async (
    playlistId: string,
    playlistName: string
  ) => {
    if (!song) {
      onError("Cannot add song to playlist. No song selected.");
      return;
    }
    setAddingSong(true);
    try {
      // Use the playlistId instead of the name
      await addSongToPlaylist(playlistId, song.uuid);
      onSuccess(
        `Song "${song.name}" added to playlist "${playlistName}" successfully!`
      );
      onClose(); // Close the modal on success
    } catch (err) {
      console.error("Failed to add song to playlist:", err);
      onError("Failed to add song to playlist. It might already be in there.");
    } finally {
      setAddingSong(false);
    }
  };

  if (!song) return null; // Don't render if there's no song selected

  return (
    <div
      className="modal show d-block"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(5px)",
      }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-light">
          <div className="modal-header">
            <h5 className="modal-title">Add "{song.name}" to Playlist</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {loading ? (
              <p>Loading playlists...</p>
            ) : playlists.length === 0 ? (
              <p>
                You have no playlists.{" "}
                <Link to="/playlists/create" onClick={onClose}>
                  Create one?
                </Link>
              </p>
            ) : (
              <ul className="list-group list-group-flush">
                {playlists.map((playlist) => (
                  <li
                    key={playlist.uuid}
                    className="list-group-item bg-dark text-light d-flex justify-content-between align-items-center"
                  >
                    {playlist.name}
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        handleAddToPlaylist(playlist.uuid, playlist.name)
                      }
                      disabled={addingSong}
                    >
                      {addingSong ? "Adding..." : "Add"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;
