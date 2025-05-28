export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
} as const;
