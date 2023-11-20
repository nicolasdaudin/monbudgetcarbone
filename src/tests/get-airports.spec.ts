import { airportBuilder } from "./airport.builder";
import { AirportFixture, createAirportFixture } from "./airport.fixture";

describe("Feature: Get airports by several characters", () => {
  let fixture: AirportFixture;
  beforeEach(() => {
    fixture = createAirportFixture();
  })

  describe('Rule: Should retrieve a list of airports by any string matching iata code, municipality or name', () => {
    test('Nicolas looks for an airport and finds an airport with a matching municipality', async () => {
      fixture.givenAirportsAre([
        airportBuilder().withIataCode('CDG').withMunicipality('Paris').build(),
      ]);

      await fixture.whenUserSearchesForAirportsWithString('paris');

      fixture.thenUserShouldSeeSomeAirports();

    });

    test('Nicolas looks for an airport and finds an airport with a matching name', async () => {
      fixture.givenAirportsAre([
        airportBuilder().withIataCode('CDG').withName('Paris').build(),
      ]);

      await fixture.whenUserSearchesForAirportsWithString('paris');

      fixture.thenUserShouldSeeSomeAirports();

    });

    test('Nicolas looks for an airport and finds an airport with a matching iata code', async () => {
      fixture.givenAirportsAre([
        airportBuilder().withIataCode('CDG').withName('Paris').build(),
      ]);

      await fixture.whenUserSearchesForAirportsWithString('CDG');

      fixture.thenUserShouldSeeSomeAirports();

    });

    test(`Nicolas looks for an airport and doesn't find any matching airport`, async () => {
      fixture.givenAirportsAre([
        airportBuilder().withCountry('Paris').build(),
      ]);

      await fixture.whenUserSearchesForAirportsWithString('Paris');

      fixture.thenUserShouldSeeTheseAirports([]);

    });

    test('Nicolas retrieves the same airports using lower and upper case strings', async () => {
      fixture.givenAirportsAre([
        airportBuilder().withIataCode('CDG').withMunicipality('Paris').build(),
      ]);

      await fixture.whenUserSearchesForAirportsWithStrings(['pAris', 'PARIS', 'paris']);

      fixture.thenUserShouldSeeSameNumberOfAirports();

    });
  });
  describe(`Rule: Should retrieve an empty list of airports when the search string doesn't exist or is empty`, () => {

    test('Nicolas retrieves an empty list for non existing strings', async () => {
      fixture.givenAirportsAre([
        airportBuilder().withIataCode('CDG').withMunicipality('Paris').build(),
      ]);

      await fixture.whenUserSearchesForAirportsWithString('xxxxxxx');

      fixture.thenUserShouldSeeTheseAirports([]);

    });

    test('Nicolas retrieves an empty list for empty strings', async () => {
      fixture.givenAirportsAre([
        airportBuilder().withIataCode('CDG').withMunicipality('Paris').build(),
      ]);

      await fixture.whenUserSearchesForAirportsWithString('');

      fixture.thenUserShouldSeeTheseAirports([]);

    });
  });


  describe('Rule: An empty list is returned when the search string is less than 3 characters', () => {
    test('Nicolas looks for an airport using only a 2-characters string and retrieves an empty list', async () => {
      fixture.givenAirportsAre([
        airportBuilder().withIataCode('BRU').build(),
        airportBuilder().withIataCode('MAD').build(),
      ])

      await fixture.whenUserSearchesForAirportsWithString('BR');

      fixture.thenUserShouldSeeTheseAirports([])
    })

    test('Nicolas looks for an airport using 3-characters string and retrieves a non-empty list', async () => {
      fixture.givenAirportsAre([
        airportBuilder().withIataCode('BRU').build(),
        airportBuilder().withIataCode('MAD').build(),
      ])

      await fixture.whenUserSearchesForAirportsWithString('BRU');

      fixture.thenUserShouldSeeTheseAirports([airportBuilder().withIataCode('BRU').build()])
    })
  })

  describe(`Rule: We can't retrieve more than 10 airports`, () => {
    test('Nicolas searches for an airport with a string that matches more than 10 airports, and retrieves only 10 airports', async () => {
      fixture.givenAirportsAre([
        airportBuilder().withIataCode('XXX1').build(),
        airportBuilder().withIataCode('XXX2').build(),
        airportBuilder().withIataCode('XXX3').build(),
        airportBuilder().withIataCode('XXX4').build(),
        airportBuilder().withIataCode('XXX5').build(),
        airportBuilder().withIataCode('XXX6').build(),
        airportBuilder().withIataCode('XXX7').build(),
        airportBuilder().withIataCode('XXX8').build(),
        airportBuilder().withIataCode('XXX9').build(),
        airportBuilder().withIataCode('XXX10').build(),
        airportBuilder().withIataCode('XXX11').build(),
      ])

      await fixture.whenUserSearchesForAirportsWithString('XXX');

      fixture.thenUserShouldOnlySeeACertainNumberOfAirports(10);
    })

  })

  describe(`Rule: We should retrieve the airports in a specific order: first the large airports when the start of the string matches, then the medium airports, then the large airports where the matches occur at the middle of the string, then the medium airports`, () => {
    test('Nicolas looks for an airport with a string that retrieves several airports ordered as expected', async () => {
      fixture.givenAirportsAre([
        airportBuilder().withIataCode('XXX1').withType('medium_airport').withMunicipality('XXX TEST1').build(),
        airportBuilder().withIataCode('XXX2').withType('large_airport').withMunicipality('TEST2 XXX').build(),
        airportBuilder().withIataCode('XXX3').withType('medium_airport').withMunicipality('TEST3 XXX').build(),
        airportBuilder().withIataCode('XXX4').withType('large_airport').withMunicipality('XXX TEST4').build(),
        airportBuilder().withIataCode('XXX5').withType('large_airport').withMunicipality('XXX TEST5').build(),
      ])

      await fixture.whenUserSearchesForAirportsWithString('TEST');

      fixture.thenUserShouldSeeTheseAirports([
        airportBuilder().withIataCode('XXX2').withType('large_airport').withMunicipality('TEST2 XXX').build(),
        airportBuilder().withIataCode('XXX3').withType('medium_airport').withMunicipality('TEST3 XXX').build(),
        airportBuilder().withIataCode('XXX4').withType('large_airport').withMunicipality('XXX TEST4').build(),
        airportBuilder().withIataCode('XXX5').withType('large_airport').withMunicipality('XXX TEST5').build(),
        airportBuilder().withIataCode('XXX1').withType('medium_airport').withMunicipality('XXX TEST1').build(),
      ])
    })
  })


})