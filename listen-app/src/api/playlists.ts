// src/api/playlists.ts
import axios from 'axios';
import type { Playlist, SongInPlaylist } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL;


// Function to create a new playlist
export const createPlaylist = async (creatorId: string, playlistName: string): Promise<string> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/playlists`, null, {
            params: {
                creator_id: creatorId,
                playlist_name: playlistName
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error('Backend error creating playlist:', error.response.data);
            throw new Error(error.response.data.detail || 'Failed to create playlist. Please check the name or user ID.');
        } else {
            console.error('Unexpected error:', error);
            throw new Error('An unexpected error occurred. Please check your network connection.');
        }
    }
};

// Function to get all playlists for a user
export const fetchUserPlaylists = async (userId: string): Promise<Playlist[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/playlists/user_playlists/${userId}`);
        // Note: The backend returns { "user": ..., "playlist": [...] }, so we need to access response.data.playlist
        return response.data.playlist;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Failed to fetch user playlists.');
        } else {
            throw new Error('An unexpected error occurred.');
        }
    }
};

// Function to get all songs in a playlist
export const fetchSongsInPlaylist = async (playlistId: string): Promise<SongInPlaylist[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/playlists/${playlistId}/songs`);
        // Backend returns { "songs": [...] } or sometimes just the array.
        if (Array.isArray(response.data.songs)) {
            return response.data.songs;
        } else if (Array.isArray(response.data)) {
            return response.data;
        } else {
            console.warn('Unexpected response format from fetchSongsInPlaylist API:', response.data);
            return [];
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Failed to fetch songs in playlist.');
        } else {
            throw new Error('An unexpected error occurred.');
        }
    }
};

// Function to add a song to a playlist
export const addSongToPlaylist = async (playlistId: string, songId: string): Promise<string> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/playlists/add_song/${playlistId}/${songId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Failed to add song to playlist.');
        } else {
            throw new Error('An unexpected error occurred.');
        }
    }
};

// Function to remove a song from a playlist
export const removeSongFromPlaylist = async (playlistId: string, songId: string): Promise<string> => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/playlists/remove_song/${playlistId}/${songId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Failed to remove song from playlist.');
        } else {
            throw new Error('An unexpected error occurred.');
        }
    }
};

// Function to get all public playlists
export const fetchPlaylists = async (): Promise<Playlist[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/playlists`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error('Backend error fetching public playlists:', error.response.data);
            throw new Error(error.response.data.detail || 'Failed to fetch public playlists.');
        } else {
            console.error('Unexpected error:', error);
            throw new Error('An unexpected error occurred. Please check your network connection.');
        }
    }
};

