import { PrismaClient } from '@prisma/client'
import { FlightTravelRepository } from "src/application/flight-travel.repository";
import { FlightTravelWithoutId, FlightTravel } from "src/domain/flight-travel";
import { Injectable } from '@nestjs/common'

@Injectable()
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

  async getById(id: number): Promise<FlightTravel> {
    const flightTravel = await this.prismaClient.flightTravel.findUniqueOrThrow(
      {
        where: { id },
        include: { routes: true }
      }
    )

    return {
      id: flightTravel.id,
      user: flightTravel.user,
      routes: flightTravel.routes.map(r => ({
        from: r.from,
        to: r.to,
        date: r.date,
        distance: r.distance,
        kgCO2eq: r.kgCO2eq,
        type: r.type,
        ...(r.order ? { order: r.order } : {})
      }))
    };
  }

  async getAllOfUser(user: string): Promise<FlightTravel[]> {
    const flightTravels = await this.prismaClient.flightTravel.findMany(
      {
        where: { user },
        include: { routes: true }
      }
    )

    return flightTravels.map(flightTravel => ({
      id: flightTravel.id,
      user: flightTravel.user,
      routes: flightTravel.routes.map(r => ({
        from: r.from,
        to: r.to,
        date: r.date,
        distance: r.distance,
        kgCO2eq: r.kgCO2eq,
        type: r.type,
        ...(r.order ? { order: r.order } : {})
      }))
    }))
  }
}