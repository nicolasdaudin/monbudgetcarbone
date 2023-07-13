import { convertDistance, getDistance, getPreciseDistance } from "geolib";
import { FlightTravel } from "../../domain/flight-travel";
import { AirportRepository } from "../airport.repository";
import { DistanceCalculator } from "../distance-calculator";

export type AddFlightTravelCommand = {
  user: string,
  fromIataCode: string,
  toIataCode: string,
  date: Date
}

export class AddFlightTravelUseCase {
  travels: FlightTravel[] = []

  constructor(
    private readonly airportRepository: AirportRepository,
    private readonly distanceCalculator: DistanceCalculator) { }

  async handle(addFlightTravelCommand: AddFlightTravelCommand): Promise<void> {
    console.log(this.travels.length);

    const fromAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.fromIataCode);
    const toAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.toIataCode);


    const distance = this.distanceCalculator.calculate(fromAirport.coordinates, toAirport.coordinates); //?
    const kgCO2eq = calculateFlightTravelCO2eqFromDistance(distance);

    this.travels.push({
      user: addFlightTravelCommand.user,
      from: addFlightTravelCommand.fromIataCode,
      to: addFlightTravelCommand.toIataCode,
      date: addFlightTravelCommand.date,
      transportType: 'plane',
      distance,
      kgCO2eq,
    })
    console.log(this.travels.length);

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
