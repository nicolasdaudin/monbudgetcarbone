export type AirportType = 'large_airport' | 'medium_airport' | 'small_airport'

export type Airport = {
  coordinates: string,
  iataCode: string,
  isoCountry: string,
  municipality: string,
  name: string,
  type: AirportType
}

export interface AirportRepository {
  getByIataCode(iata: string): Promise<Airport>;
}