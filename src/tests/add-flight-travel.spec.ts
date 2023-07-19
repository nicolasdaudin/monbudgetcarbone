import { Airport } from "../application/airport.repository";
import { airportBuilder } from "./airport.builder";
import { flightTravelBuilder } from "./flight-travel.builder";
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


      await fixture.whenUserAddsTravel({ id: 1, user: 'Nicolas', fromIataCode: 'MAD', toIataCode: 'BRU', date: new Date('2023-05-17') });

      fixture.thenAddedTravelShouldBe(
        flightTravelBuilder()
          .travelledOn(new Date('2023-05-17'))
          .withDistance(1316)
          .withCarbonFootprint(234.248)
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
        date: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe(
        baseFlightTravelBuilder
          .withDistance(999)
          .withCarbonFootprint(229.770)
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
        date: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe(
        baseFlightTravelBuilder
          .withDistance(1000)
          .withCarbonFootprint(178)
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
        date: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe(
        baseFlightTravelBuilder
          .withDistance(3499)
          .withCarbonFootprint(622.822)
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
        date: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe(
        baseFlightTravelBuilder
          .withDistance(3500)
          .withCarbonFootprint(528.5)
          .build()
      );
    });
  });
});


