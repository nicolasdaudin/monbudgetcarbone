import { Airport } from "../application/airport.repository";
import { FlightTravelFixture, createTravelFixture } from "./flight-travel.fixture";

describe('Feature: Add a flight travel', () => {
  let fixture: FlightTravelFixture;
  beforeEach(() => {
    fixture = createTravelFixture();
  })

  describe('Rule: The flight travel should have a departure and arrival airport', () => {

    test("Nicolas adds a flight travel to his list of travels", async () => {

      const airports: Airport[] = [{
        iataCode: 'MAD',
        coordinates: "-3.56264, 40.471926",
        isoCountry: 'ES',
        municipality: 'Madrid',
        name: 'Barajas',
        type: 'large_airport'
      },
      {
        iataCode: 'BRU',
        coordinates: "4.48443984985, 50.901401519800004",
        isoCountry: 'BE',
        municipality: 'Brussels',
        name: 'Brussels Airport',
        type: 'large_airport'
      }
      ]
      fixture.givenAirportsAre(airports);


      await fixture.whenUserAddsTravel({ user: 'Nicolas', fromIataCode: 'MAD', toIataCode: 'BRU', date: new Date('2023-05-17') });

      fixture.thenAddedTravelShouldBe({
        user: 'Nicolas', from: 'MAD',
        to: 'BRU',
        date: new Date('2023-05-17'),
        distance: 1316,
        kgCO2eq: 234.248,
        transportType: 'plane'
      });
    });

    test("Nicolas adds a 999km flight travel to his list of travels", async () => {

      const airports: Airport[] = [{
        iataCode: 'AAA',
        coordinates: "-3.56264, 40.471926",
        isoCountry: 'AA',
        municipality: 'AAAmuni',
        name: 'AAAname',
        type: 'large_airport'
      }, {
        iataCode: 'BBB',
        coordinates: "-4.56264, 41.471926",
        isoCountry: 'BB',
        municipality: 'BBBmuni',
        name: 'BBBname',
        type: 'large_airport'
      }]

      fixture.givenAirportsAre(airports);
      fixture.givenDistanceBetweenAirportsIs(999);




      await fixture.whenUserAddsTravel({
        user: 'Nicolas',
        fromIataCode: 'AAA',
        toIataCode: 'BBB',
        date: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe({
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

      const airports: Airport[] = [{
        iataCode: 'AAA',
        coordinates: "-3.56264, 40.471926",
        isoCountry: 'AA',
        municipality: 'AAAmuni',
        name: 'AAAname',
        type: 'large_airport'
      }, {
        iataCode: 'BBB',
        coordinates: "-5.56264, 42.471926",
        isoCountry: 'BB',
        municipality: 'BBBmuni',
        name: 'BBBname',
        type: 'large_airport'
      }]

      fixture.givenAirportsAre(airports);
      fixture.givenDistanceBetweenAirportsIs(1000)

      await fixture.whenUserAddsTravel({
        user: 'Nicolas',
        fromIataCode: 'AAA',
        toIataCode: 'BBB',
        date: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe({
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

      const airports: Airport[] = [{
        iataCode: 'AAA',
        coordinates: "-3.56264, 40.471926",
        isoCountry: 'AA',
        municipality: 'AAAmuni',
        name: 'AAAname',
        type: 'large_airport'
      }, {
        iataCode: 'BBB',
        coordinates: "-5.56264, 42.471926",
        isoCountry: 'BB',
        municipality: 'BBBmuni',
        name: 'BBBname',
        type: 'large_airport'
      }]

      fixture.givenAirportsAre(airports);
      fixture.givenDistanceBetweenAirportsIs(3499)

      await fixture.whenUserAddsTravel({
        user: 'Nicolas',
        fromIataCode: 'AAA',
        toIataCode: 'BBB',
        date: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe({
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

      const airports: Airport[] = [{
        iataCode: 'AAA',
        coordinates: "-3.56264, 40.471926",
        isoCountry: 'AA',
        municipality: 'AAAmuni',
        name: 'AAAname',
        type: 'large_airport'
      }, {
        iataCode: 'BBB',
        coordinates: "-5.56264, 42.471926",
        isoCountry: 'BB',
        municipality: 'BBBmuni',
        name: 'BBBname',
        type: 'large_airport'
      }]

      fixture.givenAirportsAre(airports);
      fixture.givenDistanceBetweenAirportsIs(3500)

      await fixture.whenUserAddsTravel({
        user: 'Nicolas',
        fromIataCode: 'AAA',
        toIataCode: 'BBB',
        date: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe({
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


