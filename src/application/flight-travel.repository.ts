import { FlightTravel } from "../domain/flight-travel";

export interface FlightTravelRepository {
  add(travel: FlightTravel): Promise<void>;
  getById(id: number): Promise<FlightTravel>;
}