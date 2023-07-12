export type Airport = {
  coordinates: string,
  iataCode: string,
  isoCountry: string,
  municipality: string,
  name: string,
  type: 'large_airport' | 'medium_airport' | 'small_airport'
}

export interface AirportRepository {
  getByIataCode(iata: string): Promise<Airport>;
}