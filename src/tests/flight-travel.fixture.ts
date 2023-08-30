import { jest } from '@jest/globals';
import { Airport } from "../application/airport.repository";
import { AddFlightTravelCommand, AddFlightTravelUseCase } from "../application/usecases/add-flight-travel.usecase";
import { FlightTravel } from "../domain/flight-travel";
import { InMemoryAirportRepository } from "../infra/airport.inmemory.repository";
import { StubDistanceCalculator } from '../infra/stub-distance-calculator';
import { DEFAULT_ID, InMemoryFlightTravelRepository } from '../infra/flight-travel.inmemory.repository';
import e from 'express';
import { ViewFlightTravelsUseCase } from '../application/usecases/view-flight-travels.usecase';
import { EditFlightTravelCommand, EditFlightTravelUseCase } from '../application/usecases/edit-flight-travel.usecase';
import { DeleteFlightTravelUseCase } from '../application/usecases/delete-flight-travel.usecase';

export const createTravelFixture = () => {
  const airportRepository = new InMemoryAirportRepository();
  const flightTravelRepository = new InMemoryFlightTravelRepository();

  const distanceCalculator = new StubDistanceCalculator();

  const addFlightTravelUseCase = new AddFlightTravelUseCase(airportRepository, flightTravelRepository, distanceCalculator);
  const viewFlightTravelsUseCase = new ViewFlightTravelsUseCase(flightTravelRepository);
  const editFlightTravelUseCase = new EditFlightTravelUseCase(airportRepository, flightTravelRepository, distanceCalculator);
  const deleteFlightTravelUseCase = new DeleteFlightTravelUseCase(flightTravelRepository);

  let actualFlightTravelsList: { id: number, from: string, to: string, outboundDate: Date, inboundDate?: Date, outboundConnection?: string, inboundCounnection?: string, kgCO2eqTotal }[];
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

    async whenUserEditsTravel(editFlightTravelCommand: EditFlightTravelCommand
    ) {
      await editFlightTravelUseCase.handle(editFlightTravelCommand);
    },

    async whenUserDeletesTravel(idToDelete: number
    ) {
      await deleteFlightTravelUseCase.handle(idToDelete);
    },

    async whenUserViewFlightTravelsOf(user: string) {
      actualFlightTravelsList = await viewFlightTravelsUseCase.handle({ user });


    },

    thenAddedTravelShouldBe(expectedTravel: FlightTravel) {
      const actualTravel = flightTravelRepository.getFlightTravelById(expectedTravel.id);//?
      expect(actualTravel).toEqual(expectedTravel);
    },

    thenTravelWithThisIdShouldBeUndefined(id: number) {
      const travel = flightTravelRepository.getFlightTravelById(id);
      expect(travel).toBeUndefined();
    },

    thenUserShouldSee(expectedFlightTravelsList: { id: number, from: string, to: string, outboundDate: Date, inboundDate?: Date, outboundConnection?: string, inboundConnection?: string, kgCO2eqTotal }[]) {
      expect(actualFlightTravelsList).toEqual(expectedFlightTravelsList)
    }

  }
}

export type FlightTravelFixture = ReturnType<typeof createTravelFixture>

