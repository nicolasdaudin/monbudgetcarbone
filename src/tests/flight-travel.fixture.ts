import { jest } from '@jest/globals';
import { Airport } from "../application/airport.repository";
import { AddFlightTravelCommand, AddFlightTravelUseCase } from "../application/usecases/add-flight-travel.usecase";
import { FlightTravel } from "../domain/flight-travel";
import { InMemoryAirportRepository } from "../infra/airport.inmemory.repository";
import { StubDistanceCalculator } from '../infra/stub-distance-calculator';
import { InMomeryFlightTravelRepository } from '../infra/flight-travel.inmemory.repository';


export const createTravelFixture = () => {
  const airportRepository = new InMemoryAirportRepository();
  const flightTravelRepository = new InMomeryFlightTravelRepository();

  const distanceCalculator = new StubDistanceCalculator();

  const addFlightTravelUseCase = new AddFlightTravelUseCase(airportRepository, flightTravelRepository, distanceCalculator);

  return {

    givenAirportsAre(airports: Airport[]) {
      airportRepository.givenExistingAirports(airports)
    },

    givenDistanceBetweenAirportsIs(distanceInKilometers: number) {
      distanceCalculator.enforceDistance(distanceInKilometers);
    },


    async whenUserAddsTravel(addFlightTravelCommand: AddFlightTravelCommand) {
      await addFlightTravelUseCase.handle(addFlightTravelCommand);
    },

    thenAddedTravelShouldBe(expectedTravel: FlightTravel) {
      const actualTravel = flightTravelRepository.getFlightTravelById(expectedTravel.id);//?
      expect(actualTravel).toEqual(expectedTravel);
    }
  }
}

export type FlightTravelFixture = ReturnType<typeof createTravelFixture>

