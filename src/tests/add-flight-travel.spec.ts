import { Airport } from "../application/airport.repository";
import { airportBuilder } from "./airport.builder";
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

      fixture.thenAddedTravelShouldBe({
        id: 1,
        user: 'Nicolas', from: 'MAD',
        to: 'BRU',
        date: new Date('2023-05-17'),
        distance: 1316,
        kgCO2eq: 234.248,
        transportType: 'plane'
      });
    });

    test("Nicolas adds a 999km flight travel to his list of travels", async () => {

      const airports = [
        airportBuilder().withIataCode('AAA').build(),
        airportBuilder().withIataCode('BBB').build()
      ]

      fixture.givenAirportsAre(airports);
      fixture.givenDistanceBetweenAirportsIs(999);




      await fixture.whenUserAddsTravel({
        user: 'Nicolas',
        fromIataCode: 'AAA',
        toIataCode: 'BBB',
        date: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe({
        id: 1,
        user: 'Nicolas',
        from: 'AAA',
        to: 'BBB',
        date: new Date('2023-05-17'),
        distance: 999,
        kgCO2eq: 229.770,
        transportType: 'plane'
      });
    });

    test("Nicolas adds a 1000km flight travel to his list of travels", async () => {

      const airports = [
        airportBuilder().withIataCode('AAA').build(),
        airportBuilder().withIataCode('BBB').build()
      ]

      fixture.givenAirportsAre(airports);
      fixture.givenDistanceBetweenAirportsIs(1000)

      await fixture.whenUserAddsTravel({
        user: 'Nicolas',
        fromIataCode: 'AAA',
        toIataCode: 'BBB',
        date: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe({
        id: 1,
        user: 'Nicolas',
        from: 'AAA',
        to: 'BBB',
        date: new Date('2023-05-17'),
        distance: 1000,
        kgCO2eq: 178,
        transportType: 'plane'
      });
    });

    test("Nicolas adds a 3499km flight travel to his list of travels", async () => {

      const airports = [
        airportBuilder().withIataCode('AAA').build(),
        airportBuilder().withIataCode('BBB').build()
      ]

      fixture.givenAirportsAre(airports);
      fixture.givenDistanceBetweenAirportsIs(3499)

      await fixture.whenUserAddsTravel({
        user: 'Nicolas',
        fromIataCode: 'AAA',
        toIataCode: 'BBB',
        date: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe({
        id: 1,
        user: 'Nicolas',
        from: 'AAA',
        to: 'BBB',
        date: new Date('2023-05-17'),
        distance: 3499,
        kgCO2eq: 622.822,
        transportType: 'plane'
      });
    });

    test("Nicolas adds a 3500km flight travel to his list of travels", async () => {

      const airports = [
        airportBuilder().withIataCode('AAA').build(),
        airportBuilder().withIataCode('BBB').build()
      ]

      fixture.givenAirportsAre(airports);
      fixture.givenDistanceBetweenAirportsIs(3500)

      await fixture.whenUserAddsTravel({
        user: 'Nicolas',
        fromIataCode: 'AAA',
        toIataCode: 'BBB',
        date: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe({
        id: 1,
        user: 'Nicolas',
        from: 'AAA',
        to: 'BBB',
        date: new Date('2023-05-17'),
        distance: 3500,
        kgCO2eq: 528.5,
        transportType: 'plane'
      });
    });

  });
});


