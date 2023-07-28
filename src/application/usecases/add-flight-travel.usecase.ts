import { convertDistance, getDistance, getPreciseDistance } from "geolib";
import { FlightTravel, OutboundInboundType, Route } from "../../domain/flight-travel";
import { Airport, AirportRepository } from "../airport.repository";
import { DistanceCalculator } from "../distance-calculator";
import { FlightTravelRepository } from "../flight-travel.repository";
import { Injectable } from "@nestjs/common"

export type AddFlightTravelCommand = {
  user: string,
  fromIataCode: string,
  toIataCode: string,
  outboundDate: Date,
  outboundConnection?: string,
  inboundDate?: Date,
  inboundConnection?: string,
}

@Injectable()
export class AddFlightTravelUseCase {

  constructor(
    private readonly airportRepository: AirportRepository,
    private readonly flightTravelRepository: FlightTravelRepository,
    private readonly distanceCalculator: DistanceCalculator) { }

  async handle(addFlightTravelCommand: AddFlightTravelCommand): Promise<void> {
    const fromAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.fromIataCode);
    const toAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.toIataCode);

    let routes: Route[] = [];

    let outboundRoutes: Route[];
    if (addFlightTravelCommand.outboundConnection) {
      const connectionAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.outboundConnection);

      outboundRoutes = this.computeRoutesWithConnection({ fromAirport, toAirport, connectionAirport, type: 'outbound', date: addFlightTravelCommand.outboundDate })
    } else {
      outboundRoutes = this.computeRouteWithoutConnection({ fromAirport, toAirport, type: 'outbound', date: addFlightTravelCommand.outboundDate });
    }
    routes = routes.concat(outboundRoutes);



    if (addFlightTravelCommand.inboundDate) {
      let inboundRoutes: Route[];
      if (addFlightTravelCommand.inboundConnection) {
        const connectionAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.inboundConnection);

        inboundRoutes = this.computeRoutesWithConnection({ fromAirport: toAirport, toAirport: fromAirport, connectionAirport, type: 'inbound', date: addFlightTravelCommand.inboundDate })
      } else {
        inboundRoutes = this.computeRouteWithoutConnection({ fromAirport: toAirport, toAirport: fromAirport, type: 'inbound', date: addFlightTravelCommand.inboundDate });
      }
      routes = routes.concat(inboundRoutes);
    }

    return await this.flightTravelRepository.add({
      user: addFlightTravelCommand.user,
      routes
    })
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
