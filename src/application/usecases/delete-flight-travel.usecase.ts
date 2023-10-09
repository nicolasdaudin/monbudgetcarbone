import { FlightTravelNotFound } from "../exceptions";
import { FlightTravelRepository } from "../flight-travel.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DeleteFlightTravelUseCase {
  constructor(private readonly flightTravelRepository: FlightTravelRepository) { }

  async handle(id: number): Promise<void> {
    const flightTravelById = await this.flightTravelRepository.getById(id);
    if (!flightTravelById) throw new FlightTravelNotFound();

    await this.flightTravelRepository.deleteById(id);
  }
}