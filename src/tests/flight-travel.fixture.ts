import { Airport } from "../application/airport.repository";
import { AddFlightTravelCommand, AddFlightTravelUseCase } from "../application/usecases/add-flight-travel.usecase";
import { FlightTravel } from "../domain/flight-travel";
import { InMemoryAirportRepository } from "../infra/airport.inmemory.repository";


export const createTravelFixture = () => {
  let distance: { from: string; to: string; distance: number }
  let carbonFootprint: { from: string; to: string; kgCO2eq: number; }
  const airportRepository = new InMemoryAirportRepository();

  const addFlightTravelUseCase = new AddFlightTravelUseCase(airportRepository);

  return {


    whenGivenAirportsAre(airports: Airport[]) {
      airportRepository.givenExistingAirports(airports)
    },



    async whenUserAddsTravel(addFlightTravelCommand: AddFlightTravelCommand) {
      await addFlightTravelUseCase.handle(addFlightTravelCommand);
    },

    thenAddedTravelShouldBe(expectedTravel: FlightTravel) {
      console.log(addFlightTravelUseCase.travels[0]);//?
      console.log(expectedTravel);//?
      expect(addFlightTravelUseCase.travels[0]).toEqual(expectedTravel);
    }
  }
}

export type FlightTravelFixture = ReturnType<typeof createTravelFixture>

