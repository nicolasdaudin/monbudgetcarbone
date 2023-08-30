import { FlightTravelRepository } from "../flight-travel.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DeleteFlightTravelUseCase {
  constructor(private readonly flightTravelRepository: FlightTravelRepository) { }

  async handle(id: number): Promise<void> {
    await this.flightTravelRepository.deleteById(id);
  }
}