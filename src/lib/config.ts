export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://tal.mawhub.io/api/v1',
  appUrl: import.meta.env.VITE_APP_URL || 'https://tal.mawhub.io',
} as const;
