import { AddFlightTravelUseCase, calculateDistanceBetweenTwoCoordinates } from "../application/usecases/add-flight-travel.usecase";
import { FlightTravelFixture, createTravelFixture } from "./flight-travel.fixture";

describe('Feature: Add a flight travel', () => {
  describe('Rule: The flight travel should have a departure and arrival airport', () => {

    let fixture: FlightTravelFixture;
    beforeEach(() => {
      fixture = createTravelFixture();
    })
    test("Nicolas adds a flight travel to his list of travels", async () => {


      await fixture.whenUserAddsTravel({ user: 'Nicolas', from: 'MAD', to: 'BRU', date: new Date('2023-05-17') });

      fixture.thenAddedTravelShouldBe({
        user: 'Nicolas', from: 'MAD',
        to: 'BRU',
        date: new Date('2023-05-17'),
        distance: 1316,
        kgCO2eq: 234.248,
        transportType: 'plane'
      });
    });

    // test.only("Nicolas adds a 999km flight travel to his list of travels", async () => {


    //   await fixture.whenUserAddsTravel({
    //     user: 'Nicolas',
    //     from: 'AAA',
    //     to: 'BBB',
    //     date: new Date('2023-05-17')
    //   });

    //   fixture.thenAddedTravelShouldBe({
    //     user: 'Nicolas',
    //     from: 'AAA',
    //     to: 'BBB',
    //     date: new Date('2023-05-17'),
    //     distance: 999,
    //     kgCO2eq: 229.770,
    //     transportType: 'plane'
    //   });
    // });

  });
});


