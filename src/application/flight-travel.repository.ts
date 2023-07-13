import { FlightTravel } from "../domain/flight-travel";

export interface FlightTravelRepository {
  addTravel(travel: FlightTravel): Promise<void>;
  getTravelById(id: number): Promise<FlightTravel>;
}