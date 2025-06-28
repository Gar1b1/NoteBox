// types.ts
// This file defines the TypeScript interfaces for your data structures.

export interface Song {
  uuid: string; // This is the unique identifier for a song.
  name: string;
  artist: string; // The name of the artist.
  album: string;
  // Add other properties if your backend returns them (e.g., duration, etc.)
  duration: number;
}

/**
 * Interface for the Playlist object as received directly from the backend API.
 * This reflects the data structure from the `GET /playlists/user_playlists/{user_id}` endpoint.
 */
export interface Playlist {
  uuid: string; // The unique identifier for the playlist.
  name: string;
  creator: string; // The username (user_id) of the creator.
  created_at: string; // Timestamp of creation.
}

/**
 * Interface for a song entry within a playlist, as returned by the backend.
 * This reflects the `PlaylistToSongs` join table structure.
 */
export interface SongInPlaylist {
  song_id: string;
  playlist_id: string;
  position: number; // The order of the song in the playlist.
}

// Add the ListItem interface here
export interface ListItem {
  id: string;
  label: string;
}

/**
 * Interface for the raw Artist object as received directly from the backend API.
 * This reflects the 'uuid' as a number.
 */
interface RawArtist {
  uuid: number; // As per the JSON you provided
  name: string;
  // Add other properties if your backend returns them
}

/**
 * Interface for the Artist object used within the frontend application.
 * The 'uuid' from the backend will be transformed into an 'id' (string) for consistency.
 */
export interface Artist {
  id: string; // Transformed from RawArtist.uuid (number to string)
  name: string;
  // Add other properties if needed, e.g., imageUrl, bio
}