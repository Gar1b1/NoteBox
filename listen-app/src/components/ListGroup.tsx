import React from "react";
import type { ListItem } from "../types"; // <-- Ensure this import is correct and points to your updated types

interface ListGroupProps {
  items: ListItem[]; // <-- This prop must be of type ListItem[], where ListItem.id is 'string'
  heading: string;
  renderRight?: (item: ListItem) => React.ReactNode; // <-- item here must be ListItem (with id: string)
  onItemClick?: (item: ListItem) => void; // <-- New prop for handling item clicks
}

function ListGroup({
  items,
  heading,
  renderRight,
  onItemClick,
}: ListGroupProps) {
  return (
    <>
      <h3 className="mb-3">{heading}</h3>
      {items.length === 0 && <p className="text-muted">No items found</p>}
      <ul className="list-group">
        {items.map((item) => (
          <li
            className={`list-group-item list-group-item-dark d-flex justify-content-between align-items-center text-light ${
              onItemClick ? "cursor-pointer" : ""
            }`}
            key={item.id} // item.id is being used here, and it must be a string
            onClick={() => onItemClick && onItemClick(item)}
            style={{ cursor: onItemClick ? "pointer" : "default" }}
          >
            {item.label}
            {renderRight && renderRight(item)}
          </li>
        ))}
      </ul>
    </>
  );
}

export default ListGroup;
