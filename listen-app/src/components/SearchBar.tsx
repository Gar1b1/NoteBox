// src/components/SearchBar.tsx
import React from "react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

/**
 * A reusable component for a search input field.
 * @param {string} searchTerm - The current value of the search input.
 * @param {function} onSearchChange - The function to call when the input value changes.
 * @param {string} [placeholder] - Optional placeholder text for the input field.
 */
const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
}) => {
  return (
    <div className="mb-4">
      <input
        type="text"
        className="form-control form-control-lg bg-dark text-light border-secondary"
        placeholder={placeholder}
        value={searchTerm}
        onChange={onSearchChange}
        aria-label="Search"
      />
    </div>
  );
};

export default SearchBar;
