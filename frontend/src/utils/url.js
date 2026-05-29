/**
 * Resolve an asset path to a full URL.
 *
 * - Absolute URLs (http/https) — returned as-is.
 * - Relative paths (/uploads/...)  — same origin in production,
 *   or VITE_API_URL prefix in cross-origin deployments.
 * - Empty / falsy — returns "".
 *
 * When frontend and backend share the same domain (Hostinger),
 * VITE_API_URL is empty, so relative paths resolve on the current host.
 */
const BACKEND = import.meta.env.VITE_API_URL || '';

export const assetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BACKEND}${path}`;
};
