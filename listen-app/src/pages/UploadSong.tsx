import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadSong } from "../api";
import { fetchArtists, createArtist } from "../api/artists";
import type { Artist } from "../types";

function UploadSong() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [songName, setSongName] = useState<string>("");
  const [selectedArtist, setSelectedArtist] = useState<string>("");
  const [newArtistName, setNewArtistName] = useState<string>("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Fetch artists on component mount
  useEffect(() => {
    const getArtists = async () => {
      try {
        const fetchedArtists = await fetchArtists();
        setArtists(fetchedArtists);
      } catch (err) {
        console.error("Failed to fetch artists:", err);
        setUploadMessage("Failed to load artist list.");
      }
    };
    getArtists();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadMessage(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleArtistChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "create_new") {
      setSelectedArtist("create_new"); // Set a special value to trigger the input
      setNewArtistName(""); // Clear the new artist name if it was previously entered
    } else {
      setSelectedArtist(value);
      setNewArtistName(""); // Clear the new artist name when a real artist is selected
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage("Please select an audio file to upload.");
      return;
    }
    if (!songName.trim()) {
      setUploadMessage("Please enter a song name.");
      return;
    }

    let finalArtistName = "";

    // Determine the artist name based on the user's selection
    if (selectedArtist === "create_new") {
      if (!newArtistName.trim()) {
        setUploadMessage("Please enter a name for the new artist.");
        return;
      }
      finalArtistName = newArtistName.trim();
    } else if (selectedArtist) {
      const artist = artists.find((a) => a.id === selectedArtist);
      if (artist) {
        finalArtistName = artist.name;
      }
    } else {
      setUploadMessage("Please select an artist or create a new one.");
      return;
    }

    setUploadStatus("uploading");
    setUploadMessage("Uploading song...");

    try {
      // Step 1: Create a new artist if the option was selected
      if (selectedArtist === "create_new") {
        try {
          await createArtist(finalArtistName);
        } catch (err) {
          // Check if the error message indicates a conflict (artist already exists)
          if ((err as Error).message.includes("already exists")) {
            setUploadStatus("error");
            setUploadMessage(
              `Error: The artist "${finalArtistName}" already exists. Please select them from the list instead.`
            );
            console.error("Artist creation failed:", err);
            return; // Stop the upload process
          } else {
            // Re-throw other errors
            throw err;
          }
        }
      }

      // Step 2: Upload the song with the determined artist name
      await uploadSong(selectedFile, songName, finalArtistName);

      setUploadStatus("success");
      setUploadMessage("Song uploaded successfully!");

      // Clear form fields
      setSelectedFile(null);
      setSongName("");
      setSelectedArtist("");
      setNewArtistName("");
      const fileInput = document.getElementById(
        "audioFileInput"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      setTimeout(() => {
        navigate("/songs");
      }, 2000);
    } catch (err) {
      setUploadStatus("error");
      console.error("Upload failed:", err);
      setUploadMessage(
        `Upload failed: ${(err as Error).message || "Unknown error"}`
      );
    }
  };

  // Determine if the form is valid for upload
  const isFormValid =
    selectedFile &&
    songName.trim() &&
    (selectedArtist === "create_new"
      ? newArtistName.trim()
      : selectedArtist !== "");
  const isUploading = uploadStatus === "uploading";

  return (
    <div className="container bg-dark text-light mt-4 p-4 rounded shadow">
      <h2 className="mb-4 text-light">Upload New Song</h2>

      <div className="card bg-secondary text-light mb-4 shadow">
        <div className="card-header">
          <h3 className="card-title text-light mb-0">Song Details</h3>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="songNameInput" className="form-label">
              Song Name
            </label>
            <input
              type="text"
              className="form-control bg-dark text-light border-secondary"
              id="songNameInput"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              placeholder="Enter song name"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="artistSelect" className="form-label">
              Artist
            </label>
            <select
              className="form-select bg-dark text-light border-secondary"
              id="artistSelect"
              value={selectedArtist}
              onChange={handleArtistChange}
            >
              <option value="">-- Select an Artist --</option>
              <option value="create_new">-- Create New Artist --</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          </div>

          {selectedArtist === "create_new" && (
            <div className="mb-3">
              <label htmlFor="newArtistInput" className="form-label">
                New Artist Name
              </label>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary"
                id="newArtistInput"
                value={newArtistName}
                onChange={(e) => setNewArtistName(e.target.value)}
                placeholder="Enter new artist name"
              />
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="audioFileInput" className="form-label">
              Audio File
            </label>
            <input
              type="file"
              className="form-control bg-dark text-light border-secondary"
              id="audioFileInput"
              accept="audio/*"
              onChange={handleFileChange}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={isUploading || !isFormValid}
          >
            {isUploading ? "Uploading..." : "Upload Song"}
          </button>
          {uploadMessage && (
            <div
              className={`mt-3 alert ${
                uploadStatus === "success"
                  ? "alert-success"
                  : uploadStatus === "error"
                  ? "alert-danger"
                  : "alert-info"
              }`}
            >
              {uploadMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadSong;
