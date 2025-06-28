// src/pages/Songs.tsx
import React, { useEffect, useState, useMemo, useCallback } from "react"; // --- UPDATED: Added useMemo and useCallback ---
import { Link } from "react-router-dom";
import ListGroup from "../components/ListGroup";
import PlaylistModal from "../components/PlaylistMoadl"; // Import the new modal component
import SearchBar from "../components/SearchBar"; // --- NEW: Import the SearchBar component ---

import { useAudioPlayerContext } from "../contexts/AudioPlayerContext";
import { fetchSongs } from "../api";
import type { Song, ListItem } from "../types";

function Songs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPlaylistModal, setShowPlaylistModal] = useState<boolean>(false);
  const [songToAdd, setSongToAdd] = useState<Song | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- NEW: State for the search term ---
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { playingId, playSong, addToQueue } = useAudioPlayerContext();

  const getSongs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSongs();
      setSongs(data);
    } catch (err) {
      console.error("Failed to fetch songs:", err);
      setError("Failed to load songs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSongs();
  }, []);

  // --- NEW: Memoized list of filtered songs based on the search term ---
  const filteredSongs = useMemo(() => {
    if (!searchTerm) {
      return songs; // Return all songs if the search term is empty
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return songs.filter(
      (song) =>
        song.name.toLowerCase().includes(lowercasedTerm) ||
        song.artist.toLowerCase().includes(lowercasedTerm)
    );
  }, [songs, searchTerm]);

  // Handler for updating the search term state
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    []
  );

  // Handler for opening the modal
  const handleOpenModal = (song: Song) => {
    setSongToAdd(song);
    setShowPlaylistModal(true);
    // Clear any previous messages
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  // Handler for closing the modal
  const handleCloseModal = () => {
    setShowPlaylistModal(false);
    setSongToAdd(null);
  };

  const handleModalSuccess = (message: string) => {
    setSuccessMessage(message);
    // Clear message after a few seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleModalError = (message: string) => {
    setErrorMessage(message);
    // Clear message after a few seconds
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // --- UPDATED: Map over the filteredSongs instead of the full songs list ---
  const items: ListItem[] = filteredSongs.map((song) => ({
    id: song.uuid,
    label: `${song.name} - ${song.artist}`,
  }));

  return (
    <div className="container bg-dark text-light mt-4 p-4 rounded shadow">
      <h2 className="mb-3 text-light">Songs</h2>

      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* --- NEW: Add the SearchBar component here --- */}
        <div style={{ flexGrow: 1, marginRight: "1rem" }}>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            placeholder="Search by song title or artist..."
          />
        </div>
        <Link to="/upload" className="btn btn-success flex-shrink-0">
          Upload New Song
        </Link>
      </div>

      {loading && <p>Loading songs...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {!loading &&
        !error &&
        // --- NEW: Add message for no search results ---
        (filteredSongs.length === 0 ? (
          <p>No songs found matching your search.</p>
        ) : (
          <ListGroup
            items={items}
            heading="Available Songs"
            renderRight={(item: ListItem) => {
              // Find the original song object from the full songs array (more reliable)
              const songToPlay = songs.find((s) => s.uuid === item.id);
              const isCurrent = playingId === item.id;
              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "0.5rem",
                    width: "100%",
                  }}
                >
                  <button
                    className="btn btn-sm btn-info"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (songToPlay) {
                        handleOpenModal(songToPlay);
                      } else {
                        console.error("Song object not found for ID:", item.id);
                      }
                    }}
                  >
                    ➕ Add to Playlist
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (songToPlay) {
                        addToQueue(songToPlay);
                      } else {
                        console.error("Song object not found for ID:", item.id);
                      }
                    }}
                  >
                    ➕ Add to Queue
                  </button>
                  <button
                    className={`btn btn-sm ${
                      isCurrent ? "btn-warning" : "btn-primary"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (songToPlay) {
                        playSong(songToPlay);
                      } else {
                        console.error("Song object not found for ID:", item.id);
                      }
                    }}
                  >
                    ▶️ Play
                  </button>
                </div>
              );
            }}
          />
        ))}

      {/* --- Render the PlaylistModal based on state --- */}
      {showPlaylistModal && (
        <PlaylistModal
          song={songToAdd}
          onClose={handleCloseModal}
          onSuccess={handleModalSuccess}
          onError={handleModalError}
        />
      )}
    </div>
  );
}

export default Songs;
