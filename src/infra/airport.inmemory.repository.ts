import { computeDestinationPoint } from "geolib";
import { AirportRepository } from "../application/airport.repository";
import { AUTHORIZED_AIRPORT_TYPES, Airport, AirportType } from 'src/domain/airport';

export class InMemoryAirportRepository implements AirportRepository {

  airports = new Map<string, Airport>()

  getByIataCode(iata: string): Airport {
    return this.airports.get(iata)
  }

  givenExistingAirports(_airports: Airport[]) {
    _airports.forEach(airport => this.airports.set(airport.iataCode, airport))
  }

  filterAirportsByType(filters: AirportType[]): Airport[] {
    return Array.from(this.airports.entries()).filter(([_, airport]) => filters.includes(airport.type)).map(([_, airport]) => airport)
  }


}