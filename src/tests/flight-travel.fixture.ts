import { AddFlightTravelCommand, AddFlightTravelUseCase } from "../application/usecases/add-flight-travel.usecase";
import { FlightTravel } from "../domain/flight-travel";


export const createTravelFixture = () => {
  let distance: { from: string; to: string; distance: number }
  let carbonFootprint: { from: string; to: string; kgCO2eq: number; }

  const addFlightTravelUseCase = new AddFlightTravelUseCase();

  return {






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

