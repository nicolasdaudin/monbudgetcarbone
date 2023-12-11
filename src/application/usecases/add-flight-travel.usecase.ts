import { convertDistance, getDistance, getPreciseDistance } from "geolib";
import { FlightTravel, OutboundInboundType, Route } from "../../domain/flight-travel";
import { AirportRepository } from "../airport.repository";
import { Airport } from '../../domain/airport';
import { DistanceCalculator } from "../distance-calculator";
import { FlightTravelRepository } from "../flight-travel.repository";
import { Injectable } from "@nestjs/common"
import { AirportNotFound } from "../exceptions";
import { ViewFlightTravelDto } from "../../domain/flight-travel.dto";

export type AddFlightTravelCommand = {
  user: string,
  fromIataCode: string,
  toIataCode: string,
  outboundDate: Date,
  outboundConnectionIataCode?: string,
  inboundDate?: Date,
  inboundConnectionIataCode?: string,
}


@Injectable()
export class AddFlightTravelUseCase {

  constructor(
    private readonly airportRepository: AirportRepository,
    private readonly flightTravelRepository: FlightTravelRepository,
    private readonly distanceCalculator: DistanceCalculator) { }

  async handle(addFlightTravelCommand: AddFlightTravelCommand): Promise<Pick<ViewFlightTravelDto, 'id' | 'kgCO2eqTotal'>> {
    const fromAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.fromIataCode);//?
    const toAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.toIataCode);//?
    if (!fromAirport) throw new AirportNotFound(addFlightTravelCommand.fromIataCode)
    if (!toAirport) throw new AirportNotFound(addFlightTravelCommand.toIataCode)


    let routes: Route[] = [];

    let outboundRoutes: Route[];
    if (addFlightTravelCommand.outboundConnectionIataCode) {
      const connectionAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.outboundConnectionIataCode);
      if (!connectionAirport) throw new AirportNotFound(addFlightTravelCommand.outboundConnectionIataCode)

      outboundRoutes = this.computeRoutesWithConnection({ fromAirport, toAirport, connectionAirport, type: 'outbound', date: addFlightTravelCommand.outboundDate })
    } else {
      outboundRoutes = this.computeRouteWithoutConnection({ fromAirport, toAirport, type: 'outbound', date: addFlightTravelCommand.outboundDate });
    }
    routes = routes.concat(outboundRoutes);



    if (addFlightTravelCommand.inboundDate) {
      let inboundRoutes: Route[];
      if (addFlightTravelCommand.inboundConnectionIataCode) {
        const connectionAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.inboundConnectionIataCode);
        if (!connectionAirport) { throw new AirportNotFound(addFlightTravelCommand.inboundConnectionIataCode) }

        inboundRoutes = this.computeRoutesWithConnection({ fromAirport: toAirport, toAirport: fromAirport, connectionAirport, type: 'inbound', date: addFlightTravelCommand.inboundDate })
      } else {
        inboundRoutes = this.computeRouteWithoutConnection({ fromAirport: toAirport, toAirport: fromAirport, type: 'inbound', date: addFlightTravelCommand.inboundDate });
      }
      routes = routes.concat(inboundRoutes);
    }

    const id = await this.flightTravelRepository.add({
      user: addFlightTravelCommand.user,
      routes
    })

    const rawKgCO2eqTotal = routes.reduce((accKgCO2, route) => accKgCO2 + route.kgCO2eq, 0)
    const kgCO2eqTotal = +(rawKgCO2eqTotal.toFixed(2));

    return { id, kgCO2eqTotal }


  }

  private computeRoutesWithConnection = ({ fromAirport, toAirport, connectionAirport, type, date }: { fromAirport: Airport, toAirport: Airport, connectionAirport: Airport, type: OutboundInboundType, date: Date }): Route[] => {
    const distanceBeforeConnection = this.distanceCalculator.calculate(fromAirport.coordinates, connectionAirport.coordinates);
    const kgCO2eqBeforeConnection = calculateFlightTravelCO2eqFromDistance(distanceBeforeConnection);

    const distanceAfterConnection = this.distanceCalculator.calculate(connectionAirport.coordinates, toAirport.coordinates);
    const kgCO2eqAfterConnection = calculateFlightTravelCO2eqFromDistance(distanceAfterConnection);
    return [{
      type,
      order: 1,
      from: fromAirport.iataCode,
      to: connectionAirport.iataCode,
      date,
      distance: distanceBeforeConnection,
      kgCO2eq: kgCO2eqBeforeConnection,
    },
    {
      type,
      order: 2,
      from: connectionAirport.iataCode,
      to: toAirport.iataCode,
      date,
      distance: distanceAfterConnection,
      kgCO2eq: kgCO2eqAfterConnection,
    }]

  }

  private computeRouteWithoutConnection = ({ fromAirport, toAirport, type, date }: { fromAirport: Airport, toAirport: Airport, type: OutboundInboundType, date: Date }): Route[] => {
    const distance = this.distanceCalculator.calculate(fromAirport.coordinates, toAirport.coordinates);
    const kgCO2eq = calculateFlightTravelCO2eqFromDistance(distance);
    return [{
      type,
      from: fromAirport.iataCode,
      to: toAirport.iataCode,
      date,
      distance,
      kgCO2eq,
    }]
  }
}





const calculateFlightTravelCO2eqFromDistance = (distanceInKm: number): number => {
  let distance;
  if (distanceInKm < 1000)
    distance = distanceInKm * 0.230;
  else if (distanceInKm < 3500)
    distance = distanceInKm * 0.178;
  else
    distance = distanceInKm * 0.151;

  return (parseFloat(distance.toFixed(3)) * 100 / 100)

}
