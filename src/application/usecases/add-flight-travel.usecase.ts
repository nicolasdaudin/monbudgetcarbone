import { convertDistance, getDistance, getPreciseDistance } from "geolib";
import { FlightTravel } from "../../domain/flight-travel";
import { AirportRepository } from "../airport.repository";
import { DistanceCalculator } from "../distance-calculator";
import { FlightTravelRepository } from "../flight-travel.repository";

export type AddFlightTravelCommand = {
  id?: number,
  user: string,
  fromIataCode: string,
  toIataCode: string,
  outboundDate: Date,
  outboundConnection?: string,
  inboundDate?: Date,
  inboundConnection?: string,
}


export class AddFlightTravelUseCase {

  constructor(
    private readonly airportRepository: AirportRepository,
    private readonly flightTravelRepository: FlightTravelRepository,
    private readonly distanceCalculator: DistanceCalculator) { }

  async handle(addFlightTravelCommand: AddFlightTravelCommand): Promise<void> {
    const fromAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.fromIataCode);
    const toAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.toIataCode);



    if (addFlightTravelCommand.outboundConnection && !addFlightTravelCommand.inboundConnection) {
      const connectionAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.outboundConnection);

      const distanceBeforeConnection = this.distanceCalculator.calculate(fromAirport.coordinates, connectionAirport.coordinates);
      const kgCO2eqBeforeConnection = calculateFlightTravelCO2eqFromDistance(distanceBeforeConnection);

      const distanceAfterConnection = this.distanceCalculator.calculate(connectionAirport.coordinates, toAirport.coordinates);
      const kgCO2eqAfterConnection = calculateFlightTravelCO2eqFromDistance(distanceAfterConnection);

      return await this.flightTravelRepository.add({
        id: addFlightTravelCommand.id || 1,
        user: addFlightTravelCommand.user,
        routes: [{
          type: 'outbound',
          order: 1,
          from: addFlightTravelCommand.fromIataCode,
          to: addFlightTravelCommand.outboundConnection,
          date: addFlightTravelCommand.outboundDate,
          distance: distanceBeforeConnection,
          kgCO2eq: kgCO2eqBeforeConnection,
        },
        {
          type: 'outbound',
          order: 2,
          from: addFlightTravelCommand.outboundConnection,
          to: addFlightTravelCommand.toIataCode,
          date: addFlightTravelCommand.outboundDate,
          distance: distanceAfterConnection,
          kgCO2eq: kgCO2eqAfterConnection,
        }]

      })

    }

    if (addFlightTravelCommand.outboundConnection && addFlightTravelCommand.inboundDate && addFlightTravelCommand.inboundConnection) {
      const outboundConnectionAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.outboundConnection);

      const distanceBeforeOutboundConnection = this.distanceCalculator.calculate(fromAirport.coordinates, outboundConnectionAirport.coordinates);
      const kgCO2eqBeforeOutboundConnection = calculateFlightTravelCO2eqFromDistance(distanceBeforeOutboundConnection);

      const distanceAfterOutboundConnection = this.distanceCalculator.calculate(outboundConnectionAirport.coordinates, toAirport.coordinates);
      const kgCO2eqAfterOutboundConnection = calculateFlightTravelCO2eqFromDistance(distanceAfterOutboundConnection);

      const inboundConnectionAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.inboundConnection);//?

      const distanceBeforeInboundConnection = this.distanceCalculator.calculate(toAirport.coordinates, inboundConnectionAirport.coordinates);//?
      const kgCO2eqBeforeInboundConnection = calculateFlightTravelCO2eqFromDistance(distanceBeforeInboundConnection);

      const distanceAfterInboundConnection = this.distanceCalculator.calculate(inboundConnectionAirport.coordinates, fromAirport.coordinates);//?
      const kgCO2eqAfterInboundConnection = calculateFlightTravelCO2eqFromDistance(distanceAfterInboundConnection);

      return await this.flightTravelRepository.add({
        id: addFlightTravelCommand.id || 1,
        user: addFlightTravelCommand.user,
        routes: [
          {
            type: 'outbound',
            order: 1,
            from: addFlightTravelCommand.fromIataCode,
            to: addFlightTravelCommand.outboundConnection,
            date: addFlightTravelCommand.outboundDate,
            distance: distanceBeforeOutboundConnection,
            kgCO2eq: kgCO2eqBeforeOutboundConnection,
          },
          {
            type: 'outbound',
            order: 2,
            from: addFlightTravelCommand.outboundConnection,
            to: addFlightTravelCommand.toIataCode,
            date: addFlightTravelCommand.outboundDate,
            distance: distanceAfterOutboundConnection,
            kgCO2eq: kgCO2eqAfterOutboundConnection,
          },
          {
            type: 'inbound',
            order: 1,
            from: addFlightTravelCommand.toIataCode,
            to: addFlightTravelCommand.inboundConnection,
            date: addFlightTravelCommand.inboundDate,
            distance: distanceBeforeInboundConnection,
            kgCO2eq: kgCO2eqBeforeInboundConnection,
          },
          {
            type: 'inbound',
            order: 2,
            from: addFlightTravelCommand.inboundConnection,
            to: addFlightTravelCommand.fromIataCode,
            date: addFlightTravelCommand.inboundDate,
            distance: distanceAfterInboundConnection,
            kgCO2eq: kgCO2eqAfterInboundConnection,
          }]

      })

    }

    const distance = this.distanceCalculator.calculate(fromAirport.coordinates, toAirport.coordinates);
    const kgCO2eq = calculateFlightTravelCO2eqFromDistance(distance);


    if (addFlightTravelCommand.inboundDate) {
      return await this.flightTravelRepository.add({
        id: addFlightTravelCommand.id || 1,
        user: addFlightTravelCommand.user,
        routes: [{
          type: 'outbound',
          from: addFlightTravelCommand.fromIataCode,
          to: addFlightTravelCommand.toIataCode,
          date: addFlightTravelCommand.outboundDate,
          distance,
          kgCO2eq,
        },
        {
          type: 'inbound',
          from: addFlightTravelCommand.toIataCode,
          to: addFlightTravelCommand.fromIataCode,
          date: addFlightTravelCommand.inboundDate,
          distance,
          kgCO2eq,
        }]

      })
    } else {
      return await this.flightTravelRepository.add({
        id: addFlightTravelCommand.id || 1,
        user: addFlightTravelCommand.user,
        routes: [{
          type: 'outbound',
          from: addFlightTravelCommand.fromIataCode,
          to: addFlightTravelCommand.toIataCode,
          date: addFlightTravelCommand.outboundDate,
          distance,
          kgCO2eq,
        }]
      })
    }



  }


}



const calculateFlightTravelCO2eqFromDistance = (distanceInKm: number): number => {
  if (distanceInKm < 1000)
    return distanceInKm * 0.230;
  else if (distanceInKm < 3500)
    return distanceInKm * 0.178;

  return distanceInKm * 0.151;

}
