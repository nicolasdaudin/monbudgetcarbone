export const LARGE_AIRPORT_TYPE = 'large_airport';
export const MEDIUM_AIRPORT_TYPE = 'medium_airport';
export const AUTHORIZED_AIRPORT_TYPES = [LARGE_AIRPORT_TYPE, MEDIUM_AIRPORT_TYPE] as const;
export type AirportType = typeof AUTHORIZED_AIRPORT_TYPES[number];

export type Airport = {
  coordinates: string;
  iataCode: string;
  country: string;
  municipality: string;
  name: string;
  type: AirportType;
};

