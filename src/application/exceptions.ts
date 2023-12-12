import { ErrorMessages } from "../common/error.messages";

export class FlightTravelNotFound extends Error {
  constructor() {
    super(ErrorMessages.error_flight_travel_not_found);
  }
}
export class AirportNotFound extends Error {
  constructor(private readonly _iataCode: string) {
    super(ErrorMessages.error_airport_not_found);
  }


  public get iataCode(): string {
    return this._iataCode
  }

}