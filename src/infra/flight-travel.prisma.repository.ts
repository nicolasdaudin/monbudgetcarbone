import { PrismaClient } from '@prisma/client'
import { FlightTravelRepository } from "src/application/flight-travel.repository";
import { FlightTravelWithoutId, FlightTravel } from "src/domain/flight-travel";

export class PrismaFlightTravelRepository implements FlightTravelRepository {
  constructor(private readonly prismaClient: PrismaClient) { }
  async add(travel: FlightTravelWithoutId): Promise<void> {
    await this.prismaClient.flightTravel.create({
      data: {
        user: travel.user,
        routes: {
          create: travel.routes
        }
      }
    })
  }
  getById(id: number): Promise<FlightTravel> {
    throw new Error("Method not implemented.");
  }
  getAllOfUser(user: string): Promise<FlightTravel[]> {
    throw new Error("Method not implemented.");
  }

}