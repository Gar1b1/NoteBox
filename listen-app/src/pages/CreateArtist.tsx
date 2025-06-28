import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createArtist } from "../api/artists"; // Import the new createArtist API function

/**
 * CreateArtist page component.
 * Provides a form to add a new artist.
 */
function CreateArtist() {
  const navigate = useNavigate();
  const [artistName, setArtistName] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "danger" | "info">(
    "info"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!artistName.trim()) {
      setStatusMessage("Artist name cannot be empty.");
      setMessageType("danger");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("Creating artist...");
    setMessageType("info");

    try {
      const message = await createArtist(artistName.trim());
      setStatusMessage(message || "Artist created successfully!");
      setMessageType("success");
      setArtistName(""); // Clear input field

      // Navigate back to the Artists page after a short delay
      setTimeout(() => {
        navigate("/artists");
      }, 2000);
    } catch (error) {
      console.error("Failed to create artist:", error);
      setStatusMessage(
        `Failed to create artist: ${
          (error as Error).message || "Unknown error"
        }`
      );
      setMessageType("danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container bg-dark text-light mt-4 p-4 rounded shadow">
      <h2 className="mb-4 text-light">Create New Artist</h2>

      <div className="card bg-secondary text-light mb-4 shadow">
        <div className="card-header">
          <h3 className="card-title text-light mb-0">Artist Details</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="artistNameInput" className="form-label">
                Artist Name
              </label>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary"
                id="artistNameInput"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Enter artist name"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !artistName.trim()}
            >
              {isSubmitting ? "Creating..." : "Create Artist"}
            </button>
            {statusMessage && (
              <div
                className={`mt-3 alert alert-dismissible fade show alert-${messageType}`}
                role="alert"
              >
                {statusMessage}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setStatusMessage(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateArtist;
