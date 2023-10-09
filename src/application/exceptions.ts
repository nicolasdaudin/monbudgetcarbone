export class FlightTravelNotFound extends Error { }
export class AirportNotFound extends Error {
  constructor(iataCode: string) {
    super(`Airport with iata code ${iataCode} not found`);
  }
}