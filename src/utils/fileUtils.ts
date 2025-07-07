// Utility functions for handling file URLs from the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://tal.mawhub.io';

/**
 * Convert a file path from the backend to a full URL
 * @param filePath - The file path from the backend (relative, absolute, or URL)
 * @returns Full URL to access the file (e.g., "https://tal.mawhub.io/uploads/candidates/filename.jpg")
 */
export const getFileUrl = (filePath: string | null | undefined): string | null => {
  if (!filePath) return null;
  
  // If it's already a full URL, return as-is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // If it's an absolute file path (Windows or Unix), extract the relative part
  if (filePath.includes('/uploads/') || filePath.includes('\\uploads\\')) {
    // Find the uploads part and create relative URL
    const uploadsIndex = filePath.indexOf('/uploads/');
    if (uploadsIndex !== -1) {
      const relativePath = filePath.substring(uploadsIndex);
      return `${API_BASE_URL}${relativePath}`;
    }
    
    // Handle Windows backslashes
    const uploadsIndexWin = filePath.indexOf('\\uploads\\');
    if (uploadsIndexWin !== -1) {
      const relativePath = filePath.substring(uploadsIndexWin).replace(/\\/g, '/');
      return `${API_BASE_URL}${relativePath}`;
    }
  }
  
  // If it's a relative path starting with /, create full URL
  if (filePath.startsWith('/')) {
    return `${API_BASE_URL}${filePath}`;
  }
  
  // If it's a relative path without leading /, add it
  return `${API_BASE_URL}/${filePath}`;
};

/**
 * Get avatar URL for a candidate
 * @param avatar - The avatar path from the candidate data
 * @returns Full URL to the avatar image or null if no avatar
 */
export const getAvatarUrl = (avatar: string | null | undefined): string | null => {
  return getFileUrl(avatar);
};

/**
 * Get document URL for a candidate document
 * @param filePath - The file path from the document data
 * @returns Full URL to the document file or null if no file path
 */
export const getDocumentUrl = (filePath: string | null | undefined): string | null => {
  return getFileUrl(filePath);
};
