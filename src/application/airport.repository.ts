import { Injectable } from '@nestjs/common'
import { Airport, AirportType } from '../domain/airport'

@Injectable()
export abstract class AirportRepository {
  abstract getByIataCode(iata: string): Airport;
  abstract filterAirportsByType(filters?: AirportType[]): Airport[];
}