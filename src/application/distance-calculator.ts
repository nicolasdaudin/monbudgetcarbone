import { convertDistance, getPreciseDistance } from "geolib";

export abstract class DistanceCalculator {
  abstract calculate(lngLatFrom: string, lngLatTo: string): number;
}

export const calculateFromCoordinates = (lngLatFrom: string, lngLatTo: string): number => {
  const [fromLongitude, fromLatitude] = lngLatFrom.split(', ');//?
  const [toLongitude, toLatitude] = lngLatTo.split(', ');

  const distanceInMeters = getPreciseDistance(
    { latitude: fromLatitude, longitude: fromLongitude },
    { latitude: toLatitude, longitude: toLongitude }
  );

  const distanceInKilometers = convertDistance(distanceInMeters, 'km')

  return Math.round(distanceInKilometers);
}

