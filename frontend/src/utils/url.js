// Resolve backend asset URLs (images, uploads)
const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const assetUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND}${path}`;
};
