import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchSongs } from "../api";
import { useAudioPlayerContext } from "../contexts/AudioPlayerContext";
import ListGroup from "../components/ListGroup";
import type { Song, ListItem } from "../types";

/**
 * ArtistDetail page component.
 * Displays all songs by a specific artist.
 */
function ArtistDetail() {
  const { artistName } = useParams<{ artistName: string }>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { playingId, playSong, addToQueue } = useAudioPlayerContext();

  useEffect(() => {
    const getArtistSongs = async () => {
      if (!artistName) return;
      
      setLoading(true);
      setError(null);
      try {
        // Fetch all songs and filter by artist
        const allSongs = await fetchSongs();
        const artistSongs = allSongs.filter(
          (song) => song.artist.toLowerCase() === decodeURIComponent(artistName).toLowerCase()
        );
        setSongs(artistSongs);
      } catch (err) {
        console.error("Failed to fetch artist songs:", err);
        setError("Failed to load artist songs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getArtistSongs();
  }, [artistName]);

  if (!artistName) {
    return (
      <div className="container bg-dark text-light mt-4 p-4 rounded shadow">
        <div className="alert alert-danger">Artist not found</div>
        <Link to="/artists" className="btn btn-secondary">
          Back to Artists
        </Link>
      </div>
    );
  }

  const decodedArtistName = decodeURIComponent(artistName);

  const items: ListItem[] = songs.map((song) => ({
    id: song.uuid,
    label: song.name,
  }));

  return (
    <div className="container bg-dark text-light mt-4 p-4 rounded shadow">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-light mb-0">
          Songs by {decodedArtistName}
        </h2>
        <Link to="/artists" className="btn btn-secondary">
          Back to Artists
        </Link>
      </div>

      {loading && <p>Loading songs...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      {!loading && !error && songs.length === 0 && (
        <div className="alert alert-info">
          No songs found for artist "{decodedArtistName}".
        </div>
      )}

      {!loading && !error && songs.length > 0 && (
        <>
          <div className="mb-3 text-muted">
            Found {songs.length} song{songs.length !== 1 ? 's' : ''} by {decodedArtistName}
          </div>
          <ListGroup
            items={items}
            heading={`Songs (${songs.length})`}
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
                      }
                    }}
                    title="Add to Queue"
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
                      }
                    }}
                    title="Play Song"
                  >
                    ▶️ Play
                  </button>
                </div>
              );
            }}
          />
        </>
      )}
    </div>
  );
}

export default ArtistDetail;