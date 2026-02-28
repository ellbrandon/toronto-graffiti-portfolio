const API_URL = 'https://torontograff.com/photos.php';

/**
 * Fetches and returns the photos array from the server.
 * Each photo: { id, filename, url, writers: string[], what: string|null, where: string|null, uploaded: string }
 */
export async function fetchPhotos() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Failed to load photos: ${res.status}`);
    return res.json();
}
