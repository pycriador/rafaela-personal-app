/**
 * Resolves an asset path to include the application's base URL (e.g. for GitHub Pages).
 * Handles relative paths, absolute paths, external URLs, and prevents double-prefixing.
 */
export function getAssetUrl(path?: string): string {
  if (!path) return '';

  // External or already resolved protocols
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  const base = import.meta.env.BASE_URL || '/';

  // If already prefixed with base URL
  if (base !== '/' && path.startsWith(base)) {
    return path;
  }

  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  return `${cleanBase}${cleanPath}`;
}
