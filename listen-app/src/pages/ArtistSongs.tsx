import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ListGroup from "../components/ListGroup";
import { useAudioPlayerContext } from "../contexts/AudioPlayerContext";
import { fetchArtistSongs } from "../api";
import type { Song, ListItem } from "../types";

function ArtistSongs() {
  const { artistName } = useParams<{ artistName: string }>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { playingId, playSong, addToQueue } = useAudioPlayerContext();

  const getArtistSongs = async () => {
    setLoading(true);
    setError(null);
    try {
      const decodedArtistName = decodeURIComponent(artistName || "");
      const artistSongs = await fetchArtistSongs(decodedArtistName);
      setSongs(artistSongs);
    } catch (err) {
      console.error("Failed to fetch artist songs:", err);
      setError("Failed to load artist songs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (artistName) {
      getArtistSongs();
    }
  }, [artistName]);

  const items: ListItem[] = songs.map((song) => ({
    id: song.uuid,
    label: song.name,
  }));

  const decodedArtistName = decodeURIComponent(artistName || "");

  return (
    <div className="container bg-dark text-light mt-4 p-4 rounded shadow">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-light mb-0">Songs by {decodedArtistName}</h2>
        <Link to="/artists" className="btn btn-outline-light">
          ← Back to Artists
        </Link>
      </div>

      {loading && <p>Loading songs...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && songs.length === 0 && (
        <div className="text-center py-4">
          <p className="text-muted">No songs found for this artist.</p>
          <Link to="/artists" className="btn btn-primary">
            Browse All Artists
          </Link>
        </div>
      )}

      {!loading && !error && songs.length > 0 && (
        <ListGroup
          items={items}
          heading={`${songs.length} song${
            songs.length === 1 ? "" : "s"
          } by ${decodedArtistName}`}
          renderRight={(item: ListItem) => {
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
      )}
    </div>
  );
}

export default ArtistSongs;
