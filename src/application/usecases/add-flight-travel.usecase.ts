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
  date: Date
}

export class AddFlightTravelUseCase {

  constructor(
    private readonly airportRepository: AirportRepository,
    private readonly flightTravelRepository: FlightTravelRepository,
    private readonly distanceCalculator: DistanceCalculator) { }

  async handle(addFlightTravelCommand: AddFlightTravelCommand): Promise<void> {
    const fromAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.fromIataCode);
    const toAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.toIataCode);


    const distance = this.distanceCalculator.calculate(fromAirport.coordinates, toAirport.coordinates); //?
    const kgCO2eq = calculateFlightTravelCO2eqFromDistance(distance);

    this.flightTravelRepository.addTravel({
      id: addFlightTravelCommand.id || 1,
      user: addFlightTravelCommand.user,
      from: addFlightTravelCommand.fromIataCode,
      to: addFlightTravelCommand.toIataCode,
      date: addFlightTravelCommand.date,
      transportType: 'plane',
      distance,
      kgCO2eq,
    })

  }


}



const calculateFlightTravelCO2eqFromDistance = (distanceInKm: number): number => {
  if (distanceInKm < 1000)
    return distanceInKm * 0.230; //?
  else if (distanceInKm < 3500)
    return distanceInKm * 0.178;
  //? 

  return distanceInKm * 0.151;

}
