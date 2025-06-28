// src/components/Queue.tsx
import React from "react";
import { useAudioPlayerContext } from "../contexts/AudioPlayerContext";
import type { Song } from "../types";

const HEADER_HEIGHT = 80; // px, height of fixed header
const PLAYER_HEIGHT = 100; // px, height of fixed audio player footer

const Queue: React.FC = () => {
  const {
    queue,
    setQueue,
    currentSong,
    playSong,
    removeFromQueue,
    clearQueue,
    isPlaying,
  } = useAudioPlayerContext();

  const shuffleArray = (array: Song[]): Song[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleShuffleQueue = () => {
    if (queue.length > 0) {
      const shuffledQueue = shuffleArray(queue);
      setQueue(shuffledQueue);
      if (!isPlaying || !currentSong) {
        playSong(shuffledQueue[0]);
      }
    }
  };

  const moveSongUp = (index: number) => {
    if (index === 0) return;
    const newQueue = [...queue];
    const isCurrentSong =
      currentSong && newQueue[index].uuid === currentSong.uuid;
    [newQueue[index - 1], newQueue[index]] = [
      newQueue[index],
      newQueue[index - 1],
    ];
    setQueue(newQueue);
  };

  const moveSongDown = (index: number) => {
    if (index === queue.length - 1) return;
    const newQueue = [...queue];
    const isCurrentSong =
      currentSong && newQueue[index].uuid === currentSong.uuid;
    [newQueue[index], newQueue[index + 1]] = [
      newQueue[index + 1],
      newQueue[index],
    ];
    setQueue(newQueue);
  };

  return (
    <aside
      className="text-light"
      style={{
        position: "fixed",
        top: `${HEADER_HEIGHT}px`,
        right: 0,
        width: "20vw",
        maxWidth: "300px",
        minWidth: "200px",
        height: `calc(100vh - ${HEADER_HEIGHT}px - ${PLAYER_HEIGHT}px)`,
        padding: "1rem",
        overflowY: "auto",
        boxShadow: "-2px 0 10px rgba(0,0,0,0.5)",
        zIndex: 1040,
        transition: "width 0.3s ease",
        backgroundColor: "#2c2c2c",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Up Next Queue</h5>
        <button
          className="btn btn-warning btn-sm"
          onClick={handleShuffleQueue}
          disabled={queue.length <= 1}
          title="Shuffle the entire queue"
        >
          🔀 Shuffle Queue
        </button>
      </div>

      {queue.length === 0 ? (
        <p>No songs in queue</p>
      ) : (
        <ul className="list-unstyled">
          {queue.map((song: Song, idx: number) => (
            <li
              key={`${song.uuid}-${idx}`}
              className={`mb-3 p-2 rounded ${
                currentSong?.uuid === song.uuid ? "bg-dark" : ""
              }`}
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div
                  onClick={() => playSong(song)}
                  title={song.name}
                  className="fw-bold flex-grow-1"
                  style={{ userSelect: "none" }}
                >
                  {idx + 1}. {song.name}
                </div>

                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className="btn btn-outline-light"
                    onClick={() => moveSongUp(idx)}
                    disabled={idx === 0}
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-light"
                    onClick={() => moveSongDown(idx)}
                    disabled={idx === queue.length - 1}
                    title="Move Down"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removeFromQueue(idx)}
                    title="Remove from Queue"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {queue.length > 0 && (
        <button
          className="btn btn-sm btn-warning mt-2"
          onClick={clearQueue}
          type="button"
        >
          Clear Queue
        </button>
      )}
    </aside>
  );
};

export default Queue;
