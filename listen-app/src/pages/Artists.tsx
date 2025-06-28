// src/pages/Artists.tsx
import React, { useEffect, useState, useMemo, useCallback } from "react"; // --- UPDATED: Added useMemo and useCallback ---
import { Link, useNavigate } from "react-router-dom";
import { fetchArtists } from "../api"; // Import fetchArtists
import ListGroup from "../components/ListGroup"; // Assuming this component exists
import SearchBar from "../components/SearchBar"; // --- NEW: Import the SearchBar component ---
import type { ListItem, Artist } from "../types"; // Import necessary types

/**
 * Artists page component.
 * Fetches all artists directly from an API endpoint and displays them in a list.
 * Includes a button to navigate to the Create Artist page.
 */
function Artists() {
  const [artists, setArtists] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // --- NEW: State for the search term ---
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const getArtists = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch artists directly from the API
        const artistsData: Artist[] = await fetchArtists();

        // Map the fetched Artist data to the ListItem format required by ListGroup
        const artistItems: ListItem[] = artistsData.map((artist) => ({
          id: artist.id, // Use the artist's unique ID
          label: artist.name, // Use the artist's name as the label
        }));
        setArtists(artistItems);
      } catch (err) {
        console.error("Failed to fetch artists:", err);
        setError("Failed to load artists. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getArtists();
  }, []);

  // --- NEW: Memoized list of filtered artists based on the search term ---
  const filteredArtists = useMemo(() => {
    if (!searchTerm) {
      return artists; // Return all artists if the search term is empty
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return artists.filter((artist) =>
      artist.label.toLowerCase().includes(lowercasedTerm)
    );
  }, [artists, searchTerm]);

  // Handler for updating the search term state
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    []
  );

  /**
   * Handles the click event on an artist item in the list.
   * Navigates to the songs page for the clicked artist, using the artist's name.
   * @param artist The ListItem object representing the clicked artist.
   */
  const handleArtistClick = (artist: ListItem) => {
    // IMPORTANT: Use artist.label (which is the artist's name) here,
    // as the backend endpoint expects the artist name in the path.
    navigate(`/artists/${encodeURIComponent(artist.label)}/songs`);
  };

  return (
    <div className="container bg-dark text-light mt-4 p-4 rounded shadow">
      <h2 className="mb-3 text-light">Artists</h2>

      {/* --- NEW: Add the SearchBar component here --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div style={{ flexGrow: 1, marginRight: "1rem" }}>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            placeholder="Search for an artist..."
          />
        </div>
        <Link
          to="/artists/create"
          className="btn btn-success rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex-shrink-0"
        >
          Create New Artist
        </Link>
      </div>

      {/* Loading, error, and empty states */}
      {loading && (
        <p className="text-center text-gray-400">Loading artists...</p>
      )}
      {error && (
        <div className="bg-red-600 text-white p-3 rounded-md mb-4">{error}</div>
      )}

      {/* --- UPDATED: Conditional rendering for the ListGroup and empty search results --- */}
      {!loading &&
        !error &&
        (filteredArtists.length === 0 ? (
          <p className="text-center text-gray-500">
            No artists found matching your search.
          </p>
        ) : (
          <ListGroup
            items={filteredArtists} // --- UPDATED: Use the filtered list ---
            heading="Browse Artists"
            onItemClick={handleArtistClick}
            // Render a "View Songs" button on the right side of each list item
            renderRight={(item: ListItem) => (
              <Link
                // IMPORTANT: Use item.label (artist's name) here for the URL
                to={`/artists/${encodeURIComponent(item.label)}/songs`}
                className="btn btn-sm btn-primary rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                // Stop propagation to prevent the parent ListGroup item's click handler from firing
                onClick={(e) => e.stopPropagation()}
              >
                🎵 View Songs
              </Link>
            )}
          />
        ))}
    </div>
  );
}

export default Artists;
