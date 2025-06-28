// api/artists.ts
// This file contains API fetching logic related to artists.

import type { Artist } from "../types"; // Import the transformed Artist type

const BASE_URL = "http://localhost:8080"; // Define your base URL here

/**
 * Fetches all artists from the API.
 * This function is used to get artists independently of songs.
 * The backend endpoint is assumed to be `/artists/all_artists`.
 * It transforms the incoming 'uuid' (number) to 'id' (string) for frontend consistency.
 * @returns A promise that resolves to an array of Artist objects.
 * @throws An error if the network response is not OK.
 */
export const fetchArtists = async (): Promise<Artist[]> => {
  try {
    // Correctly targeting the /artists/all_artists endpoint
    const response = await fetch(`${BASE_URL}/artists/all_artists`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to fetch artists: ${response.status} ${response.statusText} - ${errorData.message}`);
    }

    // Define an interface for the raw data coming from the backend
    interface RawArtist {
      uuid: number;
      name: string;
      // Include any other properties your backend returns in the raw format
    }

    const rawData: RawArtist[] = await response.json();

    // Transform the raw data to match the frontend's Artist interface (uuid: number to id: string)
    const transformedData: Artist[] = rawData.map(item => ({
      id: String(item.uuid), // Convert the numeric uuid to a string id
      name: item.name
      // Map other properties if needed
    }));

    return transformedData;
  } catch (error) {
    console.error("Error fetching artists:", error);
    throw error;
  }
};

/**
 * Creates a new artist in the backend.
 * @param artistName The name of the artist to create.
 * @returns A promise that resolves to a success message string.
 * @throws An error if the API call fails or the artist already exists.
 */
export const createArtist = async (artistName: string): Promise<string> => {
  try {
    // The backend expects artist_name as a path parameter
    const response = await fetch(`${BASE_URL}/artists/${encodeURIComponent(artistName)}`, {
      method: 'POST',
      // No body needed as artist_name is in the path
    });

    if (!response.ok) {
      let errorMessage = `Failed to create artist: ${response.status} ${response.statusText}`;
      try {
        const errorResponse = await response.json();
        // Backend returns {"detail": "Artist with the name: ... already exists"} for 409
        errorMessage = errorResponse.detail || errorMessage;
      } catch (jsonError) {
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Backend returns a plain string "Artist Created Successfully"
    const successMessage = await response.text();
    return successMessage;

  } catch (error) {
    console.error("Error creating artist:", error);
    throw error;
  }
};


/**
 * Fetches a single artist by their ID.
 * Expects the backend endpoint to handle string IDs (derived from UUIDs).
 * @param artistId The unique identifier (string) of the artist.
 * @returns A promise that resolves to an Artist object.
 * @throws An error if the artist is not found or other network issues occur.
 */
export const fetchArtistById = async (artistId: string): Promise<Artist> => {
  try {
    // Assuming backend can resolve by string ID, or implicitly converts if it's a number
    const response = await fetch(`${BASE_URL}/artists/${artistId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to fetch artist with ID ${artistId}: ${response.status} ${response.statusText} - ${errorData.message}`);
    }

    // The backend might return a RawArtist here, so we need to transform it
    interface RawArtist {
      uuid: number;
      name: string;
    }
    const rawData: RawArtist = await response.json();

    const transformedData: Artist = {
      id: String(rawData.uuid), // Convert numeric uuid to string id
      name: rawData.name
    };

    return transformedData;
  } catch (error) {
    console.error(`Error fetching artist ${artistId}:`, error);
    throw error;
  }
};

/**
 * Updates an existing artist.
 * @param artistId The ID of the artist to update.
 * @param updatedArtistData The partial data to update for the artist.
 * @returns A promise that resolves to the updated Artist object.
 */
export const updateArtist = async (artistId: string, updatedArtistData: Partial<Artist>): Promise<Artist> => {
  try {
    const response = await fetch(`${BASE_URL}/artists/${artistId}`, {
      method: 'PUT', // Or 'PATCH' depending on your API
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedArtistData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to update artist ${artistId}: ${response.status} ${response.statusText} - ${errorData.message}`);
    }

    interface RawArtist {
      uuid: number;
      name: string;
    }
    const rawData: RawArtist = await response.json();
    const transformedData: Artist = {
      id: String(rawData.uuid),
      name: rawData.name
    };

    return transformedData;
  } catch (error) {
    console.error(`Error updating artist ${artistId}:`, error);
    throw error;
  }
};

/**
 * Deletes an artist by their ID.
 * @param artistId The ID of the artist to delete.
 * @returns A promise that resolves when the artist is successfully deleted.
 */
export const deleteArtist = async (artistId: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/artists/${artistId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to delete artist ${artistId}: ${response.status} ${response.statusText} - ${errorData.message}`);
    }
  } catch (error) {
    console.error(`Error deleting artist ${artistId}:`, error);
    throw error;
  }
};
