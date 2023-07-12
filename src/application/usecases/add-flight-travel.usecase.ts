import { convertDistance, getDistance, getPreciseDistance } from "geolib";
import { FlightTravel } from "../../domain/flight-travel";
import { AirportRepository } from "../airport.repository";

export type AddFlightTravelCommand = {
  user: string,
  fromIataCode: string,
  toIataCode: string,
  date: Date
}

export class AddFlightTravelUseCase {
  travels: FlightTravel[] = []

  constructor(private readonly airportRepository: AirportRepository) { }

  async handle(addFlightTravelCommand: AddFlightTravelCommand): Promise<void> {
    console.log(this.travels.length);

    const fromAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.fromIataCode);
    const toAirport = await this.airportRepository.getByIataCode(addFlightTravelCommand.toIataCode);


    const distance = calculateDistanceBetweenTwoCoordinates(fromAirport.coordinates, toAirport.coordinates);
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

export const calculateDistanceBetweenTwoCoordinates = (lngLatFrom: string, lngLatTo: string): number => {
  const [fromLongitude, fromLatitude] = lngLatFrom.split(', ');//?
  const [toLongitude, toLatitude] = lngLatTo.split(', ');

  const distanceInMeters = getPreciseDistance(
    { latitude: fromLatitude, longitude: fromLongitude },
    { latitude: toLatitude, longitude: toLongitude }
  );

  const distanceInKilometers = convertDistance(distanceInMeters, 'km')

  return Math.round(distanceInKilometers);


}

const calculateFlightTravelCO2eqFromDistance = (distance: number): number => {
  return 234.248

}
