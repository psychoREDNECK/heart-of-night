// API configuration for different environments
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper to build full API URLs
export function getApiUrl(path: string): string {
  // In development, use relative URLs (Vite will proxy)
  if (!API_BASE_URL) {
    return path;
  }
  
  // In production/mobile, use the full URL
  return `${API_BASE_URL}${path}`;
}