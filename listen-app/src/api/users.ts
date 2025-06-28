// src/api/users.ts
const BASE_URL = "http://localhost:8080"; // Replace with your backend URL

/**
 * Creates a new user in the backend.
 * @param userId The unique ID of the user to create.
 * @returns A promise that resolves to a success message string.
 * @throws An error if the API call fails or the user already exists (409 Conflict).
 */
export const createUser = async (userId: string): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}/users?user_id=${encodeURIComponent(userId)}`, {
      method: 'POST',
    });

    if (!response.ok) {
      let errorMessage = `Failed to create user: ${response.status} ${response.statusText}`;
      try {
        const errorResponse = await response.json();
        // Backend returns {"detail": "User with user_id: ... already exists"} for 409
        errorMessage = errorResponse.detail || errorMessage;
      } catch (jsonError) {
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const successMessage = await response.text();
    return successMessage;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * Fetches all users from the API.
 * @returns A promise that resolves to an array of user IDs (strings).
 * @throws An error if the network response is not OK.
 */
export const fetchAllUsers = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${BASE_URL}/users/all_users`);
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

/**
 * Deletes a user by their ID.
 * @param userId The ID of the user to delete.
 * @returns A promise that resolves when the user is successfully deleted.
 * @throws An error if the user is not found (404) or other network issues occur.
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/users/user/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to delete user ${userId}: ${response.status} ${response.statusText} - ${errorData.message}`);
    }
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};

/**
 * Fetches a single user by their ID.
 * @param userId The unique ID of the user.
 * @returns A promise that resolves to a user object.
 * @throws An error if the user is not found (404) or other network issues occur.
 */
export const fetchUserById = async (userId: string): Promise<{ user_id: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/users/user/${encodeURIComponent(userId)}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to fetch user with ID ${userId}: ${response.status} ${response.statusText} - ${errorData.detail || 'Unknown error'}`);
    }
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};