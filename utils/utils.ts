export function convertStringToCoordinates(
  coordString: string,
): [number, number] {
  const [latStr, lonStr] = coordString.split(',');
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);
  return [lat, lon];
}
