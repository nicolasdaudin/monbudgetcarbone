import { ViewFlightTravelDto } from "../../domain/flight-travel.dto";
import { AirportRepository } from "../airport.repository";
import { FlightTravelRepository } from "../flight-travel.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ViewFlightTravelsUseCase {
  constructor(private readonly flightTravelRepository: FlightTravelRepository, private readonly airportRepository: AirportRepository) { }

  async handle({ user }: { user: string }): Promise<ViewFlightTravelDto[]> {
    const flightTravels = await this.flightTravelRepository.getAllOfUser(user);

    const actualFlightTravelsList = flightTravels.map(t => {

      const rawKgCO2eqTotal = t.routes.reduce((accKgCO2, route) => accKgCO2 + route.kgCO2eq, 0)
      const kgCO2eqTotal = +(rawKgCO2eqTotal.toFixed(2));

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

    const sortedFlightTravelsList = actualFlightTravelsList.sort((a, b) => b.outboundDate.getTime() - a.outboundDate.getTime());

    // for each sorted flight travels in the list, we want to return a similar object, but with fields from, to, outboundConnection (if it exists), inboundConnection (if it exists), turned into Airport objects
    const flightTravelsWithAirports = sortedFlightTravelsList.map(t => {
      return {
        id: t.id,
        from: this.airportRepository.getByIataCode(t.from),
        to: this.airportRepository.getByIataCode(t.to),
        outboundDate: t.outboundDate,
        inboundDate: t.inboundDate,
        outboundConnection: t.outboundConnection ? this.airportRepository.getByIataCode(t.outboundConnection) : undefined,
        inboundConnection: t.inboundConnection ? this.airportRepository.getByIataCode(t.inboundConnection) : undefined,
        kgCO2eqTotal: t.kgCO2eqTotal
      }
    })

    return flightTravelsWithAirports

  }
}