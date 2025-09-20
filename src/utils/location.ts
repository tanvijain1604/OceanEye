// Utilities for geospatial calculations and filtering

export type LatLng = { lat: number; lng: number }

export function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const R = 6371 // km
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)

  const aa = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))
  return R * c
}

function toRad(value: number) {
  return (value * Math.PI) / 180
}

export function sortByDistance<T extends LatLng>(items: T[], center: LatLng): (T & { distanceKm: number })[] {
  return items
    .map((it) => ({ ...it, distanceKm: haversineDistanceKm(center, it) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
}

export function withinRadius<T extends LatLng>(items: T[], center: LatLng, radiusKm: number): (T & { distanceKm: number })[] {
  return sortByDistance(items, center).filter((i) => i.distanceKm <= radiusKm)
}
