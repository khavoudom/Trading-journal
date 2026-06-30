const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  `http://localhost:${import.meta.env.VITE_PORT || 3001}/api`;

/** Resolves a relative upload path to a full URL pointing at the backend server. */
export function imageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const origin = API_BASE.replace(/\/api\/?$/, '');
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
}
