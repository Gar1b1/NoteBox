import React, { createContext, useContext, type ReactNode } from "react";
import type { UseAudioPlayerResult } from "../hooks/useAudioPlayer";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

type AudioPlayerContextType = UseAudioPlayerResult;

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined
);

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({
  children,
}) => {
  const audioPlayer = useAudioPlayer();
  return (
    <AudioPlayerContext.Provider value={audioPlayer}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayerContext = (): UseAudioPlayerResult => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error(
      "useAudioPlayerContext must be used within an AudioPlayerProvider"
    );
  }
  return context;
};
