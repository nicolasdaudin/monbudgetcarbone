import { FlightTravelRepository } from "../application/flight-travel.repository";
import { FlightTravel, FlightTravelWithoutId } from "../domain/flight-travel";

export const DEFAULT_ID = 1;

export class InMemoryFlightTravelRepository implements FlightTravelRepository {

  private autoIncrementedId = DEFAULT_ID;

  travels = new Map<number, FlightTravel>();

  async add(travel: FlightTravelWithoutId): Promise<void> {

    this.travels.set(this.autoIncrementedId, { ...travel, id: this.autoIncrementedId });
    this.autoIncrementedId++;
  }

  async getById(id: number): Promise<FlightTravel> {
    return this.getFlightTravelById(id);
  }

  getFlightTravelById(id: number): FlightTravel {
    return this.travels.get(id)!;
  }
}