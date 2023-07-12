import { Airport, AirportRepository } from "../application/airport.repository";

export class InMemoryAirportRepository implements AirportRepository {

  airports = new Map<string, Airport>()

  async getByIataCode(iata: string): Promise<Airport> {
    return await this.airports.get(iata)!;
  }

  givenExistingAirports(_airports: Airport[]) {
    _airports.forEach(airport => this.airports.set(airport.iataCode, airport))
  }

}