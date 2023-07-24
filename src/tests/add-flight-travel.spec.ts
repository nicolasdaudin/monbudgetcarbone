import { Airport } from "../application/airport.repository";
import { airportBuilder } from "./airport.builder";
import { flightTravelBuilder, routeBuilder } from "./flight-travel.builder";
import { FlightTravelFixture, createTravelFixture } from "./flight-travel.fixture";

describe('Feature: Add a flight travel', () => {
  let fixture: FlightTravelFixture;
  beforeEach(() => {
    fixture = createTravelFixture();
  })

  describe('Rule: The flight travel should have a departure and arrival airport', () => {

    test("Nicolas adds a flight travel to his list of travels", async () => {

      const airports = [
        airportBuilder().withIataCode('MAD').locatedAt("-3.56264, 40.471926").build(),
        airportBuilder().withIataCode('BRU').locatedAt("4.48443984985, 50.901401519800004").build(),
      ]
      fixture.givenAirportsAre(airports);


      await fixture.whenUserAddsTravel({ id: 1, user: 'Nicolas', fromIataCode: 'MAD', toIataCode: 'BRU', outboundDate: new Date('2023-05-17') });


      fixture.thenAddedTravelShouldBe(
        flightTravelBuilder()
          .withId(1)
          .withUser('Nicolas')
          .withRoutes(
            [routeBuilder()
              .from('MAD')
              .to('BRU')
              .travelledOn(new Date('2023-05-17'))
              .withDistance(1316)
              .withCarbonFootprint(234.248)
              .build()])
          .build()
      );
    });
  });
  describe("Rule: The carbon footprint of a flight travel depends on the distance of that flight: 0.230kgCO2/km for flights less than 1000 km, 0.178kgCO2/km for flights between 1000 and 3500 km, and 0.151kgCO2/km for flights over 3500 km", () => {

    const airports = [
      airportBuilder().withIataCode('AAA').build(),
      airportBuilder().withIataCode('BBB').build()
    ]
    const baseFlightTravelBuilder = flightTravelBuilder()
      .withId(1)
      .withUser('Nicolas')

    const baseRouteBuilder = routeBuilder()
      .from('AAA')
      .to('BBB')
      .travelledOn(new Date('2023-05-17'))

    test("Nicolas adds a 999km flight travel to his list of travels", async () => {


      fixture.givenAirportsAre(airports);
      fixture.givenDistanceBetweenAirportsIs(999);

      await fixture.whenUserAddsTravel({
        user: 'Nicolas',
        fromIataCode: 'AAA',
        toIataCode: 'BBB',
        outboundDate: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe(
        baseFlightTravelBuilder
          .withRoutes([baseRouteBuilder
            .withDistance(999)
            .withCarbonFootprint(229.770)
            .build()])
          .build()
      );

    });

    test("Nicolas adds a 1000km flight travel to his list of travels", async () => {

      fixture.givenAirportsAre(airports);
      fixture.givenDistanceBetweenAirportsIs(1000)

      await fixture.whenUserAddsTravel({
        user: 'Nicolas',
        fromIataCode: 'AAA',
        toIataCode: 'BBB',
        outboundDate: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe(
        baseFlightTravelBuilder
          .withRoutes([baseRouteBuilder
            .withDistance(1000)
            .withCarbonFootprint(178)
            .build()])
          .build()

      );


    });

    test("Nicolas adds a 3499km flight travel to his list of travels", async () => {

      fixture.givenAirportsAre(airports);
      fixture.givenDistanceBetweenAirportsIs(3499)

      await fixture.whenUserAddsTravel({
        user: 'Nicolas',
        fromIataCode: 'AAA',
        toIataCode: 'BBB',
        outboundDate: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe(
        baseFlightTravelBuilder
          .withRoutes([baseRouteBuilder
            .withDistance(3499)
            .withCarbonFootprint(622.822)
            .build()])
          .build()

      );


    });

    test("Nicolas adds a 3500km flight travel to his list of travels", async () => {


      fixture.givenAirportsAre(airports);
      fixture.givenDistanceBetweenAirportsIs(3500)

      await fixture.whenUserAddsTravel({
        user: 'Nicolas',
        fromIataCode: 'AAA',
        toIataCode: 'BBB',
        outboundDate: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe(
        baseFlightTravelBuilder
          .withRoutes([baseRouteBuilder
            .withDistance(3500)
            .withCarbonFootprint(528.5)
            .build()])
          .build()


      );
    });
  });
});


