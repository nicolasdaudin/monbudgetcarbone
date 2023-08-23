import { FlightTravel, FlightTravelWithoutId } from "../domain/flight-travel";
import { Injectable } from '@nestjs/common'

@Injectable()
export abstract class FlightTravelRepository {
  abstract add(travel: FlightTravelWithoutId): Promise<void>;
  abstract edit(travel: FlightTravel): Promise<void>;
  abstract getById(id: number): Promise<FlightTravel>;
  abstract getAllOfUser(user: string): Promise<FlightTravel[]>;
}