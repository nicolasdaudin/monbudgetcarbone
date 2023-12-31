import { FlightTravelNotFound } from "../application/exceptions";
import { flightTravelBuilder, routeBuilder } from "./flight-travel.builder";
import { FlightTravelFixture, createTravelFixture } from "./flight-travel.fixture";

describe(`Feature: Delete a user's flight travel`, () => {
  let fixture: FlightTravelFixture;
  beforeEach(() => {
    fixture = createTravelFixture();
  })
  describe(`Rule: A user can delete one of his flight travel`, () => {
    test('Nicolas deletes one of his flight travel and do not see it anymore afterwards', async () => {

      fixture.givenFollowingFlightTravelsExist(
        [
          flightTravelBuilder()
            .withId(1)
            .withUser('Nicolas')
            .withRoutes([routeBuilder()
              .from('BOD')
              .to('DUB')
              .travelledOn(new Date('2023-05-18'))
              .build()])
            .build(),
          flightTravelBuilder()
            .withId(2)
            .withUser('Nicolas')
            .withRoutes([routeBuilder()
              .from('MAD')
              .to('BRU')
              .travelledOn(new Date('2023-05-17'))
              .build()])
            .build()
        ]
      );

      await fixture.whenUserDeletesTravel(2);

      fixture.thenTravelWithThisIdShouldBeUndefined(2);
    })
  })

  describe(`Rule: A user can not delete a flight that does not exist`, () => {
    test('Nicolas tries to delete a flight that does not exist and gets an error', async () => {


      fixture.givenFollowingFlightTravelsExist(
        [
          flightTravelBuilder()
            .withId(1)
            .withUser('Nicolas')
            .withRoutes([routeBuilder()
              .from('BOD')
              .to('DUB')
              .travelledOn(new Date('2023-05-18'))
              .build()])
            .build(),
          flightTravelBuilder()
            .withId(2)
            .withUser('Nicolas')
            .withRoutes([routeBuilder()
              .from('MAD')
              .to('BRU')
              .travelledOn(new Date('2023-05-17'))
              .build()])
            .build()
        ]
      );

      await fixture.whenUserDeletesTravel(3);

      await fixture.thenErrorShouldBe(FlightTravelNotFound);
    })
  })
})