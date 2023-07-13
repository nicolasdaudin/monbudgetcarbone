import { FlightTravelRepository } from "../application/flight-travel.repository";
import { FlightTravel } from "../domain/flight-travel";

export class InMomeryFlightTravelRepository implements FlightTravelRepository {

  travels = new Map<number, FlightTravel>();

  async addTravel(travel: FlightTravel): Promise<void> {
    this.travels.set(travel.id, travel);
  }

  async getTravelById(id: number): Promise<FlightTravel> {
    return this.travels.get(id)!;
  }



}