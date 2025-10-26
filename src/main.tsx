import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.tsx';
import './index.css';
import './i18n/config';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes default
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
      retry: 1,
      refetchOnWindowFocus: false, // Disable refetch on window focus
      refetchOnMount: 'always', // Only refetch when data is stale
      refetchOnReconnect: 'always', // Refetch when network reconnects
      // Prevent duplicate requests
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Wrapper to conditionally enable StrictMode
const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  // Set to false during development to prevent double API calls caused by StrictMode
  // StrictMode intentionally double-invokes functions to help find side effects
  const enableStrictMode = import.meta.env.PROD || true; 
  
  return enableStrictMode ? <StrictMode>{children}</StrictMode> : <>{children}</>;
};

createRoot(document.getElementById('root')!).render(
  <AppWrapper>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </AppWrapper>
);
