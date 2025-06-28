// src/pages/ManageUsers.tsx
import React, { useState, useEffect } from "react";
import { createUser, fetchAllUsers, deleteUser } from "../api/users"; // Import the API functions

function ManageUsers() {
  const [users, setUsers] = useState<string[]>([]);
  const [newUserId, setNewUserId] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to fetch all users
  const loadUsers = async () => {
    setIsLoading(true);
    setStatusMessage("Loading users...");
    try {
      const allUsers = await fetchAllUsers();
      setUsers(allUsers);
      setStatusMessage("Users loaded successfully.");
    } catch (error) {
      setStatusMessage(`Failed to load users: ${(error as Error).message}`);
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newUserId.trim()) {
      setStatusMessage("Please enter a User ID.");
      return;
    }

    setIsLoading(true);
    setStatusMessage("Creating user...");
    try {
      const message = await createUser(newUserId);
      setStatusMessage(message);
      setNewUserId(""); // Clear the input field
      await loadUsers(); // Refresh the user list
    } catch (error) {
      setStatusMessage(`Error creating user: ${(error as Error).message}`);
      console.error("User creation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete user "${userId}"?`
    );
    if (!isConfirmed) {
      return;
    }

    setIsLoading(true);
    setStatusMessage(`Deleting user "${userId}"...`);
    try {
      await deleteUser(userId);
      setStatusMessage(`User "${userId}" deleted successfully.`);
      await loadUsers(); // Refresh the user list
    } catch (error) {
      setStatusMessage(`Error deleting user: ${(error as Error).message}`);
      console.error("User deletion failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-light mb-4">Manage Users</h1>

      {/* Add New User Form */}
      <div className="card bg-dark text-light mb-4 shadow">
        <div className="card-header">
          <h2 className="card-title text-light mb-0">Create New User</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleCreateUser} className="d-flex gap-2">
            <input
              type="text"
              className="form-control bg-secondary text-light border-dark"
              placeholder="Enter new User ID"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="btn btn-success"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>
      </div>

      {/* User List */}
      <div className="card bg-dark text-light shadow">
        <div className="card-header">
          <h2 className="card-title text-light mb-0">Existing Users</h2>
        </div>
        <div className="card-body">
          {isLoading && !users.length ? (
            <div className="text-center">Loading...</div>
          ) : users.length === 0 ? (
            <div className="alert alert-info">No users found.</div>
          ) : (
            <ul className="list-group">
              {users.map((userId) => (
                <li
                  key={userId}
                  className="list-group-item d-flex justify-content-between align-items-center bg-secondary text-light border-dark"
                >
                  <span>{userId}</span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteUser(userId)}
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
          {statusMessage && (
            <div
              className={`mt-3 alert ${
                statusMessage.includes("Error") ||
                statusMessage.includes("Failed")
                  ? "alert-danger"
                  : "alert-success"
              }`}
            >
              {statusMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageUsers;
