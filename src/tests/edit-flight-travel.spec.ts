import { airportBuilder } from "./airport.builder";
import { FlightTravelFixture, createTravelFixture } from "./flight-travel.fixture";
import { flightTravelBuilder, routeBuilder } from "./flight-travel.builder";
import { DEFAULT_ID } from "../infra/flight-travel.inmemory.repository";

describe('Feature: Edit a flight travel and calculate again its corresponding carboon footprint', () => {
  let fixture: FlightTravelFixture;
  beforeEach(() => {
    fixture = createTravelFixture();
  })
  describe('Rule: An edited flight travel should have a departure and arrival airport and can be only outbound. A carbon footprint should be recalculated', () => {

    test("Nicolas edits an existing flight travel and carboon footprint is calculated again", async () => {

      const airports = [
        airportBuilder().withIataCode('MAD').locatedAt("-3.56264, 40.471926").build(),
        airportBuilder().withIataCode('BRU').locatedAt("4.48443984985, 50.901401519800004").build(),
        airportBuilder().withIataCode("DUB").locatedAt("-6.27007, 53.421299").build()

      ]
      fixture.givenAirportsAre(airports);

      const existingFlightTravel = flightTravelBuilder()
        .withDefaultId()
        .withUser('Nicolas')
        .withRoutes([
          routeBuilder()
            .from('MAD')
            .to('BRU')
            .travelledOn(new Date('2023-05-17'))
            .withDistance(1316)
            .withCarbonFootprint(234.248)
            .build()])
        .build();


      fixture.givenFollowingFlightTravelsExist([
        existingFlightTravel
      ])

      await fixture.whenUserEditsTravel({ id: DEFAULT_ID, user: 'Nicolas', fromIataCode: 'MAD', toIataCode: 'DUB', outboundDate: new Date('2023-05-19') });

      fixture.thenAddedTravelShouldBe(
        flightTravelBuilder()
          .withDefaultId()
          .withUser('Nicolas')
          .withRoutes(
            [routeBuilder()
              .from('MAD')
              .to('DUB')
              .travelledOn(new Date('2023-05-19'))
              .withDistance(1454)
              .withCarbonFootprint(258.812)
              .build()])
          .build()
      )


    })
  })
})