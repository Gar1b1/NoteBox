import { useState, useRef, useEffect, useCallback } from "react";
import { getSongUrl } from "../api";
import type { Song } from "../types";

export interface UseAudioPlayerResult {
  playingId: string | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  currentSong: Song | null;
  queue: Song[];
  setQueue: React.Dispatch<React.SetStateAction<Song[]>>;
  playSong: (song: Song) => void;
  playPauseSong: (uuid: string) => void;
  stopSong: () => void;
  onSeekChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSeekMouseDown: () => void;
  onSeekMouseUp: (e: React.MouseEvent<HTMLInputElement>) => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleMute: () => void;
  addToQueue: (song: Song) => void;
  addMultipleToQueue: (songs: Song[]) => void;
  playNextInQueue: () => void;
  clearQueue: () => void;
  removeFromQueue: (index: number) => void;
}

export const useAudioPlayer = (): UseAudioPlayerResult => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const prevVolumeRef = useRef(volume);
  const progressRef = useRef(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  const playNextInQueueRef = useRef<(() => void) | null>(null);

  const onLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setProgress(0);
    }
  }, []);

  const onTimeUpdate = useCallback(() => {
    if (!progressRef.current && audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  }, []);

  const stopSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeEventListener("timeupdate", onTimeUpdate);
      audioRef.current.removeEventListener("loadedmetadata", onLoadedMetadata);
      if (playNextInQueueRef.current) {
        audioRef.current.removeEventListener("ended", playNextInQueueRef.current);
      }
      audioRef.current = null;
    }
    setPlayingId(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setCurrentSong(null);
  }, [onTimeUpdate, onLoadedMetadata]);

  const playSong = useCallback((song: Song) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener("timeupdate", onTimeUpdate);
      audioRef.current.removeEventListener("loadedmetadata", onLoadedMetadata);
      if (playNextInQueueRef.current) {
        audioRef.current.removeEventListener("ended", playNextInQueueRef.current);
      }
    }

    const audio = new Audio(getSongUrl(song.uuid));
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", () => {
      if (playNextInQueueRef.current) playNextInQueueRef.current();
    });

    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;

    audioRef.current = audio;

    audio.play().catch(err => console.error("Playback failed:", err));

    setPlayingId(song.uuid);
    setCurrentSong(song);
    setIsPlaying(true);
  }, [isMuted, volume, onLoadedMetadata, onTimeUpdate]);

  const playNextInQueue = useCallback(() => {
    setQueue(prevQueue => {
      if (prevQueue.length > 0) {
        const [nextSong, ...rest] = prevQueue;
        playSong(nextSong);
        return rest;
      } else {
        stopSong();
        return [];
      }
    });
  }, [playSong, stopSong]);

  playNextInQueueRef.current = playNextInQueue;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("timeupdate", onTimeUpdate);
        audioRef.current.removeEventListener("loadedmetadata", onLoadedMetadata);
        if (playNextInQueueRef.current) {
          audioRef.current.removeEventListener("ended", playNextInQueueRef.current);
        }
        audioRef.current = null;
      }
    };
  }, [onTimeUpdate, onLoadedMetadata]);

  const onSeekChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setProgress(newTime);
  }, []);

  const onSeekMouseDown = useCallback(() => {
    progressRef.current = true;
  }, []);

  const onSeekMouseUp = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const target = e.target as HTMLInputElement;
      const newTime = Number(target.value);
      audioRef.current.currentTime = newTime;
    }
    progressRef.current = false;
  }, []);

  const onVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    } else if (!isMuted && newVolume === 0) {
      setIsMuted(true);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (audioRef.current) {
        audioRef.current.muted = newMuted;
      }
      if (newMuted) {
        prevVolumeRef.current = volume;
        setVolume(0);
      } else {
        setVolume(prevVolumeRef.current > 0 ? prevVolumeRef.current : 0.5);
      }
      return newMuted;
    });
  }, [volume]);

  // --- `addToQueue` keeps its "play if idle" logic for single songs ---
  const addToQueue = useCallback(
    (song: Song) => {
      if (!currentSong) {
        playSong(song);
      } else {
        setQueue((prev) => [...prev, song]);
      }
    },
    [currentSong, playSong, setQueue]
  );

  // --- UPDATED: `addMultipleToQueue` now plays the first song if idle ---
  const addMultipleToQueue = useCallback(
      (songs: Song[]) => {
          if (!currentSong && songs.length > 0) {
              // If idle, play the first song from the list...
              playSong(songs[0]);
              // ...and add the rest to the queue.
              if (songs.length > 1) {
                  setQueue((prev) => [...prev, ...songs.slice(1)]);
              }
          } else {
              // If not idle, just add all songs to the end of the queue.
              setQueue((prev) => [...prev, ...songs]);
          }
      },
      [currentSong, playSong, setQueue]
  );
  // --- END OF UPDATED CODE ---

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  }, []);

  const playPauseSong = useCallback((uuid: string) => {
    if (audioRef.current && playingId === uuid) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(err => console.error("Playback failed:", err));
        setIsPlaying(true);
      }
    }
  }, [isPlaying, playingId]);

  return {
    playingId,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    currentSong,
    queue,
    setQueue,
    playSong,
    playPauseSong,
    stopSong,
    onSeekChange,
    onSeekMouseDown,
    onSeekMouseUp,
    onVolumeChange,
    toggleMute,
    addToQueue,
    addMultipleToQueue,
    playNextInQueue,
    clearQueue,
    removeFromQueue,
  };
};