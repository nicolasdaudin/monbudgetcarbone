import { AddFlightTravelCommand, AddFlightTravelUseCase } from "../application/usecases/add-flight-travel.usecase";
import { FlightTravel } from "../domain/flight-travel";
import { InMemoryAirportRepository } from "../infra/airport.inmemory.repository";
import { StubDistanceCalculator } from '../infra/stub-distance-calculator';
import { InMemoryFlightTravelRepository } from '../infra/flight-travel.inmemory.repository';
import { ViewFlightTravelsUseCase } from '../application/usecases/view-flight-travels.usecase';
import { EditFlightTravelCommand, EditFlightTravelUseCase } from '../application/usecases/edit-flight-travel.usecase';
import { DeleteFlightTravelUseCase } from '../application/usecases/delete-flight-travel.usecase';
import { AirportNotFound } from '../application/exceptions';
import { AirportRepository } from '../application/airport.repository';
import { ViewFlightTravelDto } from '../domain/flight-travel.dto';

export const createTravelFixture = (airportRepository: AirportRepository = new InMemoryAirportRepository()) => {

  const flightTravelRepository = new InMemoryFlightTravelRepository();

  const distanceCalculator = new StubDistanceCalculator();

  const addFlightTravelUseCase = new AddFlightTravelUseCase(airportRepository, flightTravelRepository, distanceCalculator);
  const viewFlightTravelsUseCase = new ViewFlightTravelsUseCase(flightTravelRepository, airportRepository);
  const editFlightTravelUseCase = new EditFlightTravelUseCase(airportRepository, flightTravelRepository, distanceCalculator);
  const deleteFlightTravelUseCase = new DeleteFlightTravelUseCase(flightTravelRepository);

  let thrownError: Error;

  let actualFlightTravelsList: ViewFlightTravelDto[];
  return {


    givenDistanceBetweenAirportsIs(distanceInKilometers: number) {
      distanceCalculator.enforceDistance(distanceInKilometers);
    },

    givenFollowingFlightTravelsExist(flightTravels: FlightTravel[]) {
      flightTravelRepository.givenExistingFlightTravels(flightTravels);
    },


    async whenUserAddsTravel(addFlightTravelCommand: AddFlightTravelCommand) {
      try {
        await addFlightTravelUseCase.handle(addFlightTravelCommand);
      } catch (err) {
        thrownError = err;
      }
    },

    async whenUserEditsTravel(editFlightTravelCommand: EditFlightTravelCommand
    ) {
      try {
        await editFlightTravelUseCase.handle(editFlightTravelCommand);
      } catch (err) {
        thrownError = err;
      }
    },

    async thenErrorShouldBe(expectedClass: new () => Error) {
      expect(thrownError).toBeInstanceOf(expectedClass);
    },

    async thenErrorShouldBeAirportNotFoundWithIataCode(iataCode: string) {
      expect(thrownError).toBeInstanceOf(AirportNotFound);
      expect(thrownError.message).toEqual(expect.stringContaining(iataCode));
    },

    async whenUserDeletesTravel(idToDelete: number
    ) {
      try {
        await deleteFlightTravelUseCase.handle(idToDelete);
      } catch (err) {
        thrownError = err;
      }
    },

    async whenUserViewFlightTravelsOf(user: string) {
      actualFlightTravelsList = await viewFlightTravelsUseCase.handle({ user });


    },

    thenAddedTravelShouldBe(expectedTravel: FlightTravel) {
      const actualTravel = flightTravelRepository.getFlightTravelById(expectedTravel.id);
      expect(actualTravel).toEqual(expectedTravel);
    },

    thenTravelWithThisIdShouldBeUndefined(id: number) {
      const travel = flightTravelRepository.getFlightTravelById(id);
      expect(travel).toBeUndefined();
    },

    thenUserShouldSee(expectedFlightTravelsList: { id: number, from: string, to: string, outboundDate: Date, inboundDate?: Date, outboundConnection?: string, inboundConnection?: string, kgCO2eqTotal }[]) {
      actualFlightTravelsList.map((flightTravel, index) => {
        expect(flightTravel.from.iataCode).toEqual(expectedFlightTravelsList[index].from);
        expect(flightTravel.to.iataCode).toEqual(expectedFlightTravelsList[index].to);
        if (flightTravel.outboundConnection) {
          expect(flightTravel.outboundConnection.iataCode).toEqual(expectedFlightTravelsList[index].outboundConnection);
        }
        if (flightTravel.inboundCounnection) {
          expect(flightTravel.inboundCounnection.iataCode).toEqual(expectedFlightTravelsList[index].inboundConnection);
        }

      })
    }

  }
}

export type FlightTravelFixture = ReturnType<typeof createTravelFixture>

