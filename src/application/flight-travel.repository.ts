import { FlightTravel, FlightTravelWithoutId } from "../domain/flight-travel";
import { Injectable } from '@nestjs/common'

@Injectable()
export abstract class FlightTravelRepository {
  abstract add(travel: FlightTravelWithoutId): Promise<number>;
  abstract edit(travel: FlightTravel): Promise<void>;
  abstract getById(id: number): Promise<FlightTravel | null>;
  abstract deleteById(id: number): Promise<void>;
  abstract getAllOfUser(user: string): Promise<FlightTravel[]>;
}