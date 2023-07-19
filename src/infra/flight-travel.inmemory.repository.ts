import { FlightTravelRepository } from "../application/flight-travel.repository";
import { FlightTravel } from "../domain/flight-travel";

export class InMomeryFlightTravelRepository implements FlightTravelRepository {

  travels = new Map<number, FlightTravel>();

  async add(travel: FlightTravel): Promise<void> {
    this.travels.set(travel.id, travel);
  }

  async getById(id: number): Promise<FlightTravel> {
    return this.getFlightTravelById(id);
  }

  getFlightTravelById(id: number): FlightTravel {
    return this.travels.get(id)!;
  }



}