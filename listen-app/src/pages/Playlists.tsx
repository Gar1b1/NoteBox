import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchUserPlaylists,
  fetchSongsInPlaylist,
  fetchPlaylists,
} from "../api/playlists";
import type { Playlist, Song, SongInPlaylist } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { fetchSongById } from "../api/songs";
import { useAudioPlayerContext } from "../contexts/AudioPlayerContext";

const Playlists: React.FC = () => {
  const { currentUserId } = useAuth();
  const { playSong, addToQueue, setQueue, addMultipleToQueue } =
    useAudioPlayerContext();
  const navigate = useNavigate();

  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [publicPlaylists, setPublicPlaylists] = useState<Playlist[]>([]);
  const [activeTab, setActiveTab] = useState<"my" | "public">("my");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlaylistSongs, setSelectedPlaylistSongs] = useState<Song[]>(
    []
  );
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const [songFetchError, setSongFetchError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const loadPlaylists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [userPlaylistsData, allPlaylistsData] = await Promise.all([
        currentUserId ? fetchUserPlaylists(currentUserId) : Promise.resolve([]),
        fetchPlaylists(),
      ]);

      setMyPlaylists(userPlaylistsData);
      setPublicPlaylists(allPlaylistsData);
    } catch (err) {
      console.error("Failed to fetch playlists:", err);
      setError("Failed to load playlists. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, [currentUserId]);

  const handlePlaylistClick = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setSelectedPlaylistSongs([]);
    setSongFetchError(null);

    try {
      const songsInPlaylist = await fetchSongsInPlaylist(playlist.uuid);

      const songDetailsPromises = songsInPlaylist.map(
        (songInPlaylist: SongInPlaylist) =>
          fetchSongById(songInPlaylist.song_id).catch((err) => {
            console.error(
              `Failed to fetch song with ID ${songInPlaylist.song_id}:`,
              err
            );
            return null;
          })
      );

      const results = await Promise.all(songDetailsPromises);

      const fullSongs = results.filter((song): song is Song => song !== null);

      setSelectedPlaylistSongs(fullSongs);

      if (fullSongs.length < songsInPlaylist.length) {
        setSongFetchError(
          `Some songs (${songsInPlaylist.length - fullSongs.length} of ${
            songsInPlaylist.length
          }) could not be loaded for this playlist. They may no longer exist.`
        );
      }
    } catch (err) {
      console.error("Failed to fetch songs for playlist:", err);
      setSongFetchError(
        "Failed to load songs for this playlist. Please try again."
      );
    }
  };

  const handlePlayPlaylist = () => {
    if (selectedPlaylistSongs.length > 0) {
      const firstSong = selectedPlaylistSongs[0];
      const restOfSongs = selectedPlaylistSongs.slice(1);
      setQueue(restOfSongs);
      playSong(firstSong);
    }
  };

  const shuffleArray = (array: Song[]): Song[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleShufflePlay = () => {
    if (selectedPlaylistSongs.length > 0) {
      const shuffledSongs = shuffleArray(selectedPlaylistSongs);
      const firstSong = shuffledSongs[0];
      const restOfSongs = shuffledSongs.slice(1);
      setQueue(restOfSongs);
      playSong(firstSong);
    }
  };

  const handleAddPlaylistToQueue = () => {
    if (selectedPlaylistSongs.length > 0) {
      addMultipleToQueue(selectedPlaylistSongs);
    }
  };

  const handleShuffleAddToQueue = () => {
    if (selectedPlaylistSongs.length > 0) {
      const shuffledSongs = shuffleArray(selectedPlaylistSongs);
      addMultipleToQueue(shuffledSongs);
    }
  };

  // Updated filtering: filter by playlist name OR creator (case-insensitive)
  const filteredPlaylists = useMemo(() => {
    const playlists = activeTab === "my" ? myPlaylists : publicPlaylists;
    if (!searchTerm) return playlists;
    const lowerSearch = searchTerm.toLowerCase();
    return playlists.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerSearch) ||
        (p.creator && p.creator.toLowerCase().includes(lowerSearch))
    );
  }, [searchTerm, activeTab, myPlaylists, publicPlaylists]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setSelectedPlaylist(null);
      setSelectedPlaylistSongs([]);
      setSongFetchError(null);
    },
    []
  );

  if (isLoading) {
    return <div className="text-center mt-5">Loading playlists...</div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-5">{error}</div>;
  }

  return (
    <div className="container mt-4 text-light">
      <h2 className="mb-4">Playlists</h2>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === "my" ? "active" : ""}`}
            href="#"
            onClick={() => {
              setActiveTab("my");
              setSearchTerm("");
              setSelectedPlaylist(null);
              setSelectedPlaylistSongs([]);
              setSongFetchError(null);
            }}
          >
            My Playlists
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === "public" ? "active" : ""}`}
            href="#"
            onClick={() => {
              setActiveTab("public");
              setSearchTerm("");
              setSelectedPlaylist(null);
              setSelectedPlaylistSongs([]);
              setSongFetchError(null);
            }}
          >
            Public Playlists
          </a>
        </li>
      </ul>

      {/* Search bar */}
      <div className="mb-3">
        <input
          type="search"
          className="form-control"
          placeholder={`Search ${
            activeTab === "my" ? "my" : "public"
          } playlists by name or creator...`}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="row">
        <div className="col-md-6">
          {activeTab === "my" && (
            <>
              <div className="mb-4">
                <button
                  className="btn btn-success"
                  onClick={() => navigate("/playlists/create")}
                >
                  ➕ Create New Playlist
                </button>
              </div>
              {filteredPlaylists.length === 0 ? (
                <p>
                  {searchTerm
                    ? "No playlists found matching your search."
                    : "You don't have any playlists yet."}
                </p>
              ) : (
                <ul className="list-group">
                  {filteredPlaylists.map((playlist) => (
                    <li
                      key={playlist.uuid}
                      className={`list-group-item list-group-item-action bg-secondary text-light border-dark mb-2 rounded ${
                        selectedPlaylist?.uuid === playlist.uuid ? "active" : ""
                      }`}
                      onClick={() => handlePlaylistClick(playlist)}
                      style={{ cursor: "pointer" }}
                    >
                      {playlist.name}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {activeTab === "public" && (
            <>
              {filteredPlaylists.length === 0 ? (
                <p>
                  {searchTerm
                    ? "No public playlists found matching your search."
                    : "No public playlists found."}
                </p>
              ) : (
                <ul className="list-group">
                  {filteredPlaylists.map((playlist) => (
                    <li
                      key={playlist.uuid}
                      className={`list-group-item list-group-item-action bg-secondary text-light border-dark mb-2 rounded ${
                        selectedPlaylist?.uuid === playlist.uuid ? "active" : ""
                      }`}
                      onClick={() => handlePlaylistClick(playlist)}
                      style={{ cursor: "pointer" }}
                    >
                      <strong>{playlist.name}</strong> by {playlist.creator}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <div className="col-md-6">
          {selectedPlaylist && (
            <div className="card bg-dark text-light mt-4 mt-md-0">
              <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                <h4 className="mb-2 mb-md-0">{selectedPlaylist.name}</h4>
                {selectedPlaylistSongs.length > 0 && (
                  <div className="btn-group mt-2 mt-md-0" role="group">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handlePlayPlaylist}
                      type="button"
                    >
                      ▶️ Play All
                    </button>
                    <button
                      className="btn btn-info btn-sm"
                      onClick={handleShufflePlay}
                      type="button"
                    >
                      🔀 Shuffle Play
                    </button>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleAddPlaylistToQueue}
                      type="button"
                    >
                      ➕ Add to Queue
                    </button>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={handleShuffleAddToQueue}
                      type="button"
                    >
                      🔀 Shuffle & Add
                    </button>
                  </div>
                )}
              </div>
              {songFetchError && (
                <div className="alert alert-warning m-3">{songFetchError}</div>
              )}
              <ul className="list-group list-group-flush">
                {selectedPlaylistSongs.length === 0 ? (
                  <li className="list-group-item bg-secondary text-light">
                    This playlist has no songs or failed to load.
                  </li>
                ) : (
                  selectedPlaylistSongs.map((song) => (
                    <li
                      key={song.uuid}
                      className="list-group-item bg-secondary text-light d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{song.name}</strong> by {song.artist}
                      </div>
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          className="btn btn-outline-success"
                          onClick={() => playSong(song)}
                        >
                          ▶️ Play
                        </button>
                        <button
                          className="btn btn-outline-info"
                          onClick={() => addToQueue(song)}
                        >
                          ➕ Queue
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playlists;
