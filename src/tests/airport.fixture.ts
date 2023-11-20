import { Airport } from '../domain/airport';
import { InMemoryAirportRepository } from "../infra/airport.inmemory.repository";
import { AirportNotFound } from '../application/exceptions';

import { GetAirportsUseCase } from '../application/usecases/get-airports.usecase';


export const createAirportFixture = () => {
  const airportRepository = new InMemoryAirportRepository();

  // const distanceCalculator = new StubDistanceCalculator();

  let thrownError: Error;

  let actualAirports: Airport[];
  let actualAirportsArray: Airport[][]

  const getAirportsUseCase = new GetAirportsUseCase(airportRepository);

  return {
    airportRepository,
    givenAirportsAre(airports: Airport[]) {
      airportRepository.givenExistingAirports(airports)
    },

    // givenDistanceBetweenAirportsIs(distanceInKilometers: number) {
    //   distanceCalculator.enforceDistance(distanceInKilometers);
    // },

    async whenUserSearchesForAirportsWithString(searchStr: string) {
      actualAirports = await getAirportsUseCase.handle({ searchStr });
    },
    async whenUserSearchesForAirportsWithStrings(searchStrs: string[]) {
      actualAirportsArray = await Promise.all(searchStrs.map(searchStr => getAirportsUseCase.handle({ searchStr })));
    },

    thenUserShouldSeeTheseAirports(expectedAirports: Airport[]) {
      expect(actualAirports).toEqual(expectedAirports);
    },

    thenUserShouldSeeSomeAirports() {
      expect(actualAirports.length).toBeGreaterThan(0);
    },

    thenUserShouldSeeSameNumberOfAirports() {
      expect(actualAirportsArray[0].length).toEqual(actualAirportsArray[1].length);
      expect(actualAirportsArray[1].length).toEqual(actualAirportsArray[2].length);
    },

    thenUserShouldOnlySeeACertainNumberOfAirports(numberOfAirports: number) {
      expect(actualAirports.length).toEqual(numberOfAirports);
    },

    async thenErrorShouldBeAirportNotFoundWithIataCode(iataCode: string) {
      expect(thrownError).toBeInstanceOf(AirportNotFound);
      expect(thrownError.message).toEqual(expect.stringContaining(iataCode));
    },
  }
}

export type AirportFixture = ReturnType<typeof createAirportFixture>

