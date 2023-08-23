import { FlightTravel, OutboundInboundType, Route } from "../../domain/flight-travel";
import { Airport, AirportRepository } from "../airport.repository";
import { DistanceCalculator } from "../distance-calculator";
import { FlightTravelRepository } from "../flight-travel.repository";
import { Injectable } from "@nestjs/common"
import { AddFlightTravelCommand } from "./add-flight-travel.usecase";

export type EditFlightTravelCommand = AddFlightTravelCommand & {
  id: number
}


@Injectable()
export class EditFlightTravelUseCase {

  constructor(
    private readonly airportRepository: AirportRepository,
    private readonly flightTravelRepository: FlightTravelRepository,
    private readonly distanceCalculator: DistanceCalculator) { }

  async handle(editFlightTravelCommand: EditFlightTravelCommand): Promise<void> {

    const fromAirport = await this.airportRepository.getByIataCode(editFlightTravelCommand.fromIataCode);
    const toAirport = await this.airportRepository.getByIataCode(editFlightTravelCommand.toIataCode);

    let routes: Route[] = [];

    let outboundRoutes: Route[];
    if (editFlightTravelCommand.outboundConnection) {
      const connectionAirport = await this.airportRepository.getByIataCode(editFlightTravelCommand.outboundConnection);

      outboundRoutes = this.computeRoutesWithConnection({ fromAirport, toAirport, connectionAirport, type: 'outbound', date: editFlightTravelCommand.outboundDate })
    } else {
      outboundRoutes = this.computeRouteWithoutConnection({ fromAirport, toAirport, type: 'outbound', date: editFlightTravelCommand.outboundDate });
    }
    routes = routes.concat(outboundRoutes);



    if (editFlightTravelCommand.inboundDate) {
      let inboundRoutes: Route[];
      if (editFlightTravelCommand.inboundConnection) {
        const connectionAirport = await this.airportRepository.getByIataCode(editFlightTravelCommand.inboundConnection);

        inboundRoutes = this.computeRoutesWithConnection({ fromAirport: toAirport, toAirport: fromAirport, connectionAirport, type: 'inbound', date: editFlightTravelCommand.inboundDate })
      } else {
        inboundRoutes = this.computeRouteWithoutConnection({ fromAirport: toAirport, toAirport: fromAirport, type: 'inbound', date: editFlightTravelCommand.inboundDate });
      }
      routes = routes.concat(inboundRoutes);
    }

    return await this.flightTravelRepository.edit({
      id: editFlightTravelCommand.id,
      user: editFlightTravelCommand.user,
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
