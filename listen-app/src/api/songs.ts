// api/songs.ts
// This file contains API fetching logic related to songs, interacting with a backend.

import type { Song } from "../types"; // Use type-only import

const BASE_URL = "http://localhost:8080"; // Define your base URL here

/**
 * Fetches a list of all songs from the API.
 * @returns A promise that resolves to an array of Song objects.
 * @throws An error if the network response is not OK.
 */
export const fetchSongs = async (): Promise<Song[]> => {
  try {
    const response = await fetch(`${BASE_URL}/songs`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to fetch songs: ${response.status} ${response.statusText} - ${errorData.message}`);
    }

    const data: Song[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching songs:", error);
    throw error;
  }
};

/**
 * Constructs the URL for a specific song's audio file.
 * This function uses the backend route `GET /songs/{uuid}` which serves the MP3 file.
 * @param uuid The unique identifier (string) of the song.
 * @returns The URL string for the song's audio.
 */
export const getSongUrl = (uuid: string): string => { // Changed uuid type to string
  return `${BASE_URL}/songs/${uuid}`; 
};

/**
 * Uploads a new song to the API.
 * @param file The audio file to upload.
 * @param name The name of the song.
 * @param artist The artist of the song.
 * @returns A promise that resolves to the newly created Song object.
 * @throws An error if the upload fails.
 */
export const uploadSong = async (file: File, name: string, artist: string): Promise<Song> => {
  const formData = new FormData();
  // Only append the file to formData.
  // song_name and artist_name will be sent as query parameters in the URL.
  formData.append('song_file', file);

  // Encode parameters for URL
  const encodedSongName = encodeURIComponent(name);
  const encodedArtistName = encodeURIComponent(artist);

  try {
    // Construct the URL with song_name and artist_name as query parameters
    const uploadUrl = `${BASE_URL}/songs?song_name=${encodedSongName}&artist_name=${encodedArtistName}`;

    const response = await fetch(uploadUrl, { // Use the constructed URL
      method: 'POST',
      // DO NOT set Content-Type header manually for FormData.
      // The browser will set it automatically with the correct 'multipart/form-data' boundary.
      body: formData, // formData now only contains the file
    });

    if (!response.ok) {
      let errorMessage = `Failed to upload song: ${response.status} ${response.statusText}`;
      let responseBodyText = '';

      try {
        responseBodyText = await response.text();
        const errorResponse = JSON.parse(responseBodyText);

        if (Array.isArray(errorResponse)) {
          errorMessage = errorResponse.map(err => {
            if (typeof err === 'object' && err !== null) {
              return err.msg || err.detail || JSON.stringify(err);
            }
            return String(err);
          }).join('; ');
        } else if (typeof errorResponse === 'object' && errorResponse !== null) {
          errorMessage = errorResponse.detail || errorResponse.message || errorResponse.error || JSON.stringify(errorResponse);
        } else if (typeof errorResponse === 'string') {
          errorMessage = errorResponse;
        }
        if (!errorMessage || errorMessage.includes('[object Object]') || errorMessage.trim() === '') {
          errorMessage = `Failed to upload song: ${response.status} ${response.statusText} - unexpected/empty response.`;
        }
      } catch (jsonOrTextError) {
        errorMessage = responseBodyText || `Failed to upload song: ${response.status} ${response.statusText} - could not parse response.`;
      }
      throw new Error(errorMessage);
    }

    console.log("Song uploaded successfully (backend response was not JSON for created object).");
    // Corrected: Return a placeholder with the required 'duration' property.
    return { uuid: Date.now().toString(), name: name, artist: artist, album: "", duration: 0 }; 
  } catch (error) {
    console.error("Error uploading song:", error);
    throw error;
  }
};

/**
 * Fetches a single song by its UUID.
 * * IMPORTANT: This implementation is a workaround for a backend that serves
 * the audio file instead of JSON metadata at the /songs/{uuid} endpoint.
 * This method fetches the ENTIRE list of all songs and then finds the
 * one with the matching UUID. This is INEFFICIENT for large libraries.
 * * The proper, scalable solution is to add a dedicated backend endpoint
 * that returns a single song's JSON data, for example, `GET /songs/{uuid}/details`.
 * * @param uuid The unique identifier (string) of the song.
 * @returns A promise that resolves to a Song object.
 * @throws An error if the song is not found or other network issues occur.
 */
export const fetchSongById = async (uuid: string): Promise<Song> => {
  try {
    // 1. Fetch the metadata for ALL songs from the /songs endpoint.
    const allSongs = await fetchSongs();
    
    // 2. Find the song with the correct UUID in the list.
    const song = allSongs.find(s => String(s.uuid) === String(uuid));

    if (!song) {
      throw new Error(`Song with UUID ${uuid} not found in the fetched list of songs.`);
    }
    
    return song;
  } catch (error) {
    console.error(`Error fetching song ${uuid}:`, error);
    throw error;
  }
};

/**
 * Creates a new song.
 * @param newSongData The data for the new song (e.g., name, artist).
 * @returns A promise that resolves to the newly created Song object.
 */
export const createSong = async (newSongData: Omit<Song, 'uuid'>): Promise<Song> => {
  try {
    const response = await fetch(`${BASE_URL}/songs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSongData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to create song: ${response.status} ${response.statusText} - ${errorData.message}`);
    }

    const createdSong: Song = await response.json();
    return createdSong;
  } catch (error) {
    console.error("Error creating song:", error);
    throw error;
  }
};

/**
 * Updates an existing song.
 * @param uuid The UUID of the song to update.
 * @param updatedSongData The partial data to update for the song.
 * @returns A promise that resolves to the updated Song object.
 */
export const updateSong = async (uuid: string, updatedSongData: Partial<Song>): Promise<Song> => { // Changed uuid type to string
  try {
    const response = await fetch(`${BASE_URL}/songs/${uuid}`, {
      method: 'PUT', // Or 'PATCH' depending on your API
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSongData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to update song ${uuid}: ${response.status} ${response.statusText} - ${errorData.message}`);
    }

    const updatedSong: Song = await response.json();
    return updatedSong;
  } catch (error) {
    console.error(`Error updating song ${uuid}:`, error);
    throw error;
  }
};

/**
 * Deletes a song by its UUID.
 * @param uuid The UUID of the song to delete.
 * @returns A promise that resolves when the song is successfully deleted.
 */
export const deleteSong = async (uuid: string): Promise<void> => { // Changed uuid type to string
  try {
    const response = await fetch(`${BASE_URL}/songs/${uuid}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to delete song ${uuid}: ${response.status} ${response.statusText} - ${errorData.message}`);
    }
  } catch (error) {
    console.error(`Error deleting song ${uuid}:`, error);
    throw error;
  }
};

/**
 * Fetches songs for a specific artist from the API.
 * @param artistName The name of the artist to fetch songs for.
 * @returns A promise that resolves to an array of Song objects.
 * @throws An error if the network response is not OK.
 */
export const fetchArtistSongs = async (artistName: string): Promise<Song[]> => {
  try {
    const encodedArtistName = encodeURIComponent(artistName);
    const response = await fetch(`${BASE_URL}/artists/${encodedArtistName}/songs`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to fetch songs for artist ${artistName}: ${response.status} ${response.statusText} - ${errorData.message}`);
    }

    const data: { Songs: Song[] } = await response.json();
    return data.Songs;
  } catch (error) {
    console.error(`Error fetching songs for artist ${artistName}:`, error);
    throw error;
  }
};