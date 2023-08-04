import { FlightTravelRepository } from "../flight-travel.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ViewFlightTravelsUseCase {
  constructor(private readonly flightTravelRepository: FlightTravelRepository) { }

  async handle({ user }: { user: string }): Promise<{ id: number, from: string, to: string, outboundDate: Date, inboundDate?: Date, outboundConnection?: string, inboundCounnection?: string, kgCO2eqTotal }[]> {
    const flightTravels = await this.flightTravelRepository.getAllOfUser(user);

    const actualFlightTravelsList = flightTravels.map(t => {

      const kgCO2eqTotal = t.routes.reduce((accKgCO2, route) => accKgCO2 + route.kgCO2eq, 0);

      if (t.routes.length === 1)
        return {
          id: t.id,
          from: t.routes[0].from,
          to: t.routes[0].to,
          outboundDate: t.routes[0].date,
          kgCO2eqTotal,
        }


      if (t.routes.length === 2) {
        if (t.routes[0].type === 'outbound' && t.routes[1].type === 'outbound') {
          return {
            id: t.id,
            from: t.routes[0].from,
            to: t.routes[1].to,
            outboundDate: t.routes[0].date,
            kgCO2eqTotal,
            outboundConnection: t.routes[0].to
          }
        }
        if (t.routes[0].type === 'outbound' && t.routes[1].type === 'inbound') {
          return {
            id: t.id,
            from: t.routes[0].from,
            to: t.routes[0].to,
            outboundDate: t.routes[0].date,
            inboundDate: t.routes[1].date,
            kgCO2eqTotal,
          }
        }
      }

      if (t.routes.length === 3) {
        if (t.routes[0].type === 'outbound' && t.routes[1].type === 'outbound') {
          return {
            id: t.id,
            from: t.routes[0].from,
            to: t.routes[1].to,
            outboundDate: t.routes[0].date,
            inboundDate: t.routes[2].date,
            kgCO2eqTotal,
            outboundConnection: t.routes[0].to
          }
        }
        if (t.routes[0].type === 'outbound' && t.routes[1].type === 'inbound') {
          return {
            id: t.id,
            from: t.routes[0].from,
            to: t.routes[0].to,
            outboundDate: t.routes[0].date,
            inboundDate: t.routes[1].date,
            inboundConnection: t.routes[1].to,
            kgCO2eqTotal,
          }
        }
      }

      if (t.routes.length === 4) {
        return {
          id: t.id,
          from: t.routes[0].from,
          to: t.routes[1].to,
          outboundDate: t.routes[0].date,
          inboundDate: t.routes[2].date,
          outboundConnection: t.routes[0].to,
          inboundConnection: t.routes[2].to,
          kgCO2eqTotal,
        }
      }
    })

    return actualFlightTravelsList.sort((a, b) => b.outboundDate.getTime() - a.outboundDate.getTime());

  }
}