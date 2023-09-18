import { FlightTravelRepository } from "../application/flight-travel.repository";
import { FlightTravel, FlightTravelWithoutId } from "../domain/flight-travel";
import { Injectable } from '@nestjs/common'

export const DEFAULT_ID = 1;

@Injectable()
export class InMemoryFlightTravelRepository implements FlightTravelRepository {




  private autoIncrementedId = DEFAULT_ID;

  travels = new Map<number, FlightTravel>();

  async add(travel: FlightTravelWithoutId): Promise<void> {

    this.travels.set(this.autoIncrementedId, { ...travel, id: this.autoIncrementedId });
    this.autoIncrementedId++;

  }

  async edit(travel: FlightTravel): Promise<void> {
    this.travels.set(travel.id, travel);
  }

  async deleteById(id: number): Promise<void> {
    this.travels.delete(id);
  }

  async getById(id: number): Promise<FlightTravel | null> {
    return this.getFlightTravelById(id);
  }

  async getAllOfUser(user: string): Promise<FlightTravel[]> {
    return Promise.resolve([...this.travels.values()].filter(travel => travel.user === user))

  }

  getFlightTravelById(id: number): FlightTravel | null {
    return this.travels.get(id)!;
  }

  givenExistingFlightTravels(flightTravels: FlightTravel[]) {
    flightTravels.forEach(travel => {
      this.travels.set(travel.id, travel);
    });
  }
} 