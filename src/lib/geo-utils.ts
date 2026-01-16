/**
 * Calculates the distance between two geographic coordinates using the Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Formats distance for display.
 * Shows meters for distances < 1km, otherwise shows km with 1 decimal.
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Adds distance to an array of items with lat/lng coordinates.
 * Returns items sorted by distance (nearest first).
 */
export function addDistanceToItems<T extends { lat: number | null; lng: number | null }>(
  items: T[],
  userLat: number | null,
  userLng: number | null
): (T & { distance: number | null })[] {
  return items.map(item => {
    let distance: number | null = null;

    if (userLat && userLng && item.lat && item.lng) {
      distance = calculateDistance(userLat, userLng, item.lat, item.lng);
    }

    return { ...item, distance };
  });
}

/**
 * Sorts items by distance (nearest first).
 * Items without distance are placed at the end.
 */
export function sortByDistance<T extends { distance: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.distance === null && b.distance === null) return 0;
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });
}
