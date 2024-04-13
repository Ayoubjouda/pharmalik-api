export function calculateBoundary(
  latitude: number,
  longitude: number,
  radius: number,
): { lat: [number, number]; lon: [number, number] } {
  // Earth radius in kilometers
  const earthRadius: number = 6371.0;

  // Convert latitude and longitude from degrees to radians
  const latRad: number = toRadians(latitude);
  const lonRad: number = toRadians(longitude);

  // Calculate the angular distance in radians
  const angularDistance: number = radius / earthRadius;

  // Calculate the latitude boundaries
  const latMin: number = toDegrees(latRad - angularDistance);
  const latMax: number = toDegrees(latRad + angularDistance);

  // Calculate the longitude boundaries
  const deltaLon: number = Math.asin(
    Math.sin(angularDistance) / Math.cos(latRad),
  );
  const lonMin: number = toDegrees(lonRad - deltaLon);
  const lonMax: number = toDegrees(lonRad + deltaLon);

  return {
    lat: [latMin, latMax],
    lon: [lonMin, lonMax],
  };
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function convertStringToCoordinates(
  coordString: string,
): [number, number] {
  const [latStr, lonStr] = coordString.split(',');
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);
  return [lat, lon];
}
