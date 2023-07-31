import { jest } from '@jest/globals';
import { Airport } from "../application/airport.repository";
import { AddFlightTravelCommand, AddFlightTravelUseCase } from "../application/usecases/add-flight-travel.usecase";
import { FlightTravel } from "../domain/flight-travel";
import { InMemoryAirportRepository } from "../infra/airport.inmemory.repository";
import { StubDistanceCalculator } from '../infra/stub-distance-calculator';
import { DEFAULT_ID, InMemoryFlightTravelRepository } from '../infra/flight-travel.inmemory.repository';
import e from 'express';


export const createTravelFixture = () => {
  const airportRepository = new InMemoryAirportRepository();
  const flightTravelRepository = new InMemoryFlightTravelRepository();

  const distanceCalculator = new StubDistanceCalculator();

  const addFlightTravelUseCase = new AddFlightTravelUseCase(airportRepository, flightTravelRepository, distanceCalculator);

  let actualFlightTravelsList: { id: number, from: string, to: string, outboundDate: Date, kgCO2eqTotal }[];
  return {

    givenAirportsAre(airports: Airport[]) {
      airportRepository.givenExistingAirports(airports)
    },

    givenDistanceBetweenAirportsIs(distanceInKilometers: number) {
      distanceCalculator.enforceDistance(distanceInKilometers);
    },

    givenFollowingFlightTravelsExist(flightTravels: FlightTravel[]) {
      flightTravelRepository.givenExistingFlightTravels(flightTravels);
    },


    async whenUserAddsTravel(addFlightTravelCommand: AddFlightTravelCommand) {
      await addFlightTravelUseCase.handle(addFlightTravelCommand);
    },

    async whenUserViewFlightTravelsOf(user: string) {
      const flightTravels = await flightTravelRepository.getAllOfUser(user);


      actualFlightTravelsList = flightTravels.map(t => ({
        id: t.id,
        from: t.routes[0].from,
        to: t.routes[0].to,
        outboundDate: t.routes[0].date,
        kgCO2eqTotal: t.routes[0].kgCO2eq
      }))


    },

    thenAddedTravelShouldBe(expectedTravel: FlightTravel) {
      const actualTravel = flightTravelRepository.getFlightTravelById(expectedTravel.id);//?
      expect(actualTravel).toEqual(expectedTravel);
    },

    thenUserShouldSee(expectedFlightTravelsList: { id: number, from: string, to: string, outboundDate: Date, kgCO2eqTotal }[]) {
      expect(actualFlightTravelsList).toEqual(expectedFlightTravelsList)
    }

  }
}

export type FlightTravelFixture = ReturnType<typeof createTravelFixture>

