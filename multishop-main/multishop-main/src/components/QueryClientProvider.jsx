import React from 'react';
import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';

// ✅ Create a global QueryClient with aggressive refetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 0, // Always consider data stale for instant updates
      retry: 1,
    },
  },
});

// ✅ Make queryClient globally available for ReturnService
if (typeof window !== 'undefined') {
  window.queryClient = queryClient;
}

export default function QueryClientProvider({ children }) {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  );
}