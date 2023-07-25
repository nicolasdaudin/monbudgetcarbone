import { FlightTravel, FlightTravelWithoutId } from "../domain/flight-travel";

export interface FlightTravelRepository {
  add(travel: FlightTravelWithoutId): Promise<void>;
  getById(id: number): Promise<FlightTravel>;
}