import { convertDistance, getDistance, getPreciseDistance } from "geolib";
import { FlightTravel } from "../../domain/flight-travel";

export type AddFlightTravelCommand = {
  user: string,
  from: string,
  to: string,
  date: Date
}

export class AddFlightTravelUseCase {
  travels: FlightTravel[] = []

  async handle(addFlightTravelCommand: AddFlightTravelCommand): Promise<void> {
    console.log(this.travels.length);
    const coordMAD = "-3.56264, 40.471926";
    const coordBRU = "4.48443984985, 50.901401519800004";

    const distance = calculateDistanceBetweenTwoCoordinates(coordMAD, coordBRU);
    const kgCO2eq = calculateFlightTravelCO2eqFromDistance(distance);

    this.travels.push({
      user: addFlightTravelCommand.user,
      from: addFlightTravelCommand.from,
      to: addFlightTravelCommand.to,
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
