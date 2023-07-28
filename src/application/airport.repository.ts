import { Injectable } from '@nestjs/common'

export const AUTHORIZED_AIRPORT_TYPES = ['large_airport', 'medium_airport', 'small_airport']
export type AirportType = 'large_airport' | 'medium_airport' | 'small_airport'

export type Airport = {
  coordinates: string,
  iataCode: string,
  isoCountry: string,
  municipality: string,
  name: string,
  type: AirportType
}

@Injectable()
export abstract class AirportRepository {
  abstract getByIataCode(iata: string): Promise<Airport>;
}