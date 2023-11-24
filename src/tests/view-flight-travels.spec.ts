import { airportBuilder } from "./airport.builder";
import { AirportFixture, createAirportFixture } from "./airport.fixture";
import { flightTravelBuilder, routeBuilder } from "./flight-travel.builder";
import { FlightTravelFixture, createTravelFixture } from "./flight-travel.fixture"

describe("Feature: View carbon footprints for a user's flight travels", () => {
  let travelFixture: FlightTravelFixture;
  let airportFixture: AirportFixture;
  beforeEach(() => {
    airportFixture = createAirportFixture();
    travelFixture = createTravelFixture(airportFixture.airportRepository);

    const airports = [
      airportBuilder().withIataCode('MAD').locatedAt("-3.56264, 40.471926").build(),
      airportBuilder().withIataCode('BRU').locatedAt("4.48443984985, 50.901401519800004").build(),
      airportBuilder().withIataCode("DUB").locatedAt("-6.27007, 53.421299").build(),
      airportBuilder().withIataCode('AMS').locatedAt("4.76389, 52.308601").build(),
      airportBuilder().withIataCode('UIO').locatedAt("-78.3575, -0.129166666667").build(),
      airportBuilder().withIataCode('BOD').locatedAt("-0.715556025505, 44.828300476100004").build(),
      airportBuilder().withIataCode('TLS').locatedAt("1.36382, 43.629101").build(),

    ]
    airportFixture.givenAirportsAre(airports);
  })

  describe('Rule: A user can see his carbon footprint for all of his flight travels', () => {
    test('Nicolas can see his carbon footprint for a single flight travel with no connection', async () => {

      travelFixture.givenFollowingFlightTravelsExist(
        [flightTravelBuilder()
          .withId(1)
          .withUser('Nicolas')
          .withRoutes([routeBuilder()
            .withType('outbound')
            .from('MAD')
            .to('BRU')
            .travelledOn(new Date('2023-05-17'))
            .withDistance(1000)
            .withCarbonFootprint(230)
            .build()
          ])
          .build()
        ]
      );

      await travelFixture.whenUserViewFlightTravelsOf('Nicolas');

      travelFixture.thenUserShouldSee([
        {
          id: 1,
          from: 'MAD',
          to: 'BRU',
          outboundDate: new Date('2023-05-17'),
          kgCO2eqTotal: 230
        }
      ])
    }
    )

    test('Nicolas can see his total carbon footprint for a single flight travel with a connection', async () => {

      const routeBeforeConnection = routeBuilder()
        .from('MAD')
        .to('AMS')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(1400)
        .withCarbonFootprint(200)
        .withType('outbound')
        .withOrder(1)
        .build();
      const routeAfterConnection = routeBuilder()
        .from('AMS')
        .to('UIO')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(9500)
        .withCarbonFootprint(1400)
        .withType('outbound')
        .withOrder(2)
        .build();

      travelFixture.givenFollowingFlightTravelsExist(
        [flightTravelBuilder()
          .withId(1)
          .withUser('Nicolas')
          .withRoutes([routeBeforeConnection, routeAfterConnection])
          .build()
        ]
      );

      await travelFixture.whenUserViewFlightTravelsOf('Nicolas');

      travelFixture.thenUserShouldSee([
        {
          id: 1,
          from: 'MAD',
          to: 'UIO',
          outboundDate: new Date('2023-05-17'),
          outboundConnection: 'AMS',
          kgCO2eqTotal: 1600
        }
      ])
    })

    test('Nicolas can see his total carbon footprint for a return flight travel with no connections', async () => {
      const outboundRoute = routeBuilder()
        .from('MAD')
        .to('BRU')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(1300)
        .withCarbonFootprint(234)
        .withType('outbound')
        .build()
      const inboundRoute = routeBuilder()
        .from('BRU')
        .to('MAD')
        .travelledOn(new Date('2023-05-20'))
        .withDistance(1300)
        .withCarbonFootprint(234)
        .withType('inbound')
        .build()

      travelFixture.givenFollowingFlightTravelsExist(
        [flightTravelBuilder()
          .withId(1)
          .withUser('Nicolas')
          .withRoutes([outboundRoute, inboundRoute])
          .build()
        ]
      );

      await travelFixture.whenUserViewFlightTravelsOf('Nicolas');

      travelFixture.thenUserShouldSee([
        {
          id: 1,
          from: 'MAD',
          to: 'BRU',
          outboundDate: new Date('2023-05-17'),
          inboundDate: new Date('2023-05-20'),
          kgCO2eqTotal: 468
        }
      ])
    })

    test('Nicolas can see his total carbon footprint for a return flight travel with an outbound connection and no inbound connection', async () => {
      const outboundRouteBeforeConnection = routeBuilder()
        .from('MAD')
        .to('AMS')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(1400)
        .withCarbonFootprint(260)
        .withType('outbound')
        .withOrder(1)
        .build();
      const outboundRouteAfterConnection = routeBuilder()
        .from('AMS')
        .to('UIO')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(9500)
        .withCarbonFootprint(1400)
        .withType('outbound')
        .withOrder(2)
        .build();
      const inboundRoute = routeBuilder()
        .from('UIO')
        .to('MAD')
        .travelledOn(new Date('2023-06-04'))
        .withDistance(8700)
        .withCarbonFootprint(1300)
        .withType('inbound')
        .build();

      travelFixture.givenFollowingFlightTravelsExist(
        [flightTravelBuilder()
          .withId(1)
          .withUser('Nicolas')
          .withRoutes([outboundRouteBeforeConnection, outboundRouteAfterConnection, inboundRoute])
          .build()
        ]
      );

      await travelFixture.whenUserViewFlightTravelsOf('Nicolas');

      travelFixture.thenUserShouldSee([
        {
          id: 1,
          from: 'MAD',
          to: 'UIO',
          outboundDate: new Date('2023-05-17'),
          outboundConnection: 'AMS',
          inboundDate: new Date('2023-06-04'),
          kgCO2eqTotal: 2960
        }
      ])
    })

    test('Nicolas can see his total carbon footprint for a return flight travel with no outbound connection and one inbound connection', async () => {
      const outboundRoute = routeBuilder()
        .from('MAD')
        .to('UIO')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(8700)
        .withCarbonFootprint(1300)
        .withType('outbound')
        .build();
      const inboundRouteBeforeConnection = routeBuilder()
        .from('UIO')
        .to('BOG')
        .travelledOn(new Date('2023-06-04'))
        .withDistance(700)
        .withCarbonFootprint(160)
        .withType('inbound')
        .withOrder(1)
        .build();
      const inboundRouteAfterConnection = routeBuilder()
        .from('BOG')
        .to('MAD')
        .travelledOn(new Date('2023-06-04'))
        .withDistance(8000)
        .withCarbonFootprint(1200)
        .withType('inbound')
        .withOrder(2)
        .build();

      travelFixture.givenFollowingFlightTravelsExist(
        [flightTravelBuilder()
          .withId(1)
          .withUser('Nicolas')
          .withRoutes([outboundRoute, inboundRouteBeforeConnection, inboundRouteAfterConnection])
          .build()
        ]
      );

      await travelFixture.whenUserViewFlightTravelsOf('Nicolas');

      travelFixture.thenUserShouldSee([
        {
          id: 1,
          from: 'MAD',
          to: 'UIO',
          outboundDate: new Date('2023-05-17'),
          inboundConnection: 'BOG',
          inboundDate: new Date('2023-06-04'),
          kgCO2eqTotal: 2660
        }
      ])
    })

    test('Nicolas can see his total carbon footprint for a return flight travel with one outbound connection and one inbound connection', async () => {
      const outboundRouteBeforeConnection = routeBuilder()
        .from('MAD')
        .to('AMS')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(1400)
        .withCarbonFootprint(260)
        .withType('outbound')
        .withOrder(1)
        .build();
      const outboundRouteAfterConnection = routeBuilder()
        .from('AMS')
        .to('UIO')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(9500)
        .withCarbonFootprint(1400)
        .withType('outbound')
        .withOrder(2)
        .build();
      const inboundRouteBeforeConnection = routeBuilder()
        .from('UIO')
        .to('BOG')
        .travelledOn(new Date('2023-06-04'))
        .withDistance(700)
        .withCarbonFootprint(160)
        .withType('inbound')
        .withOrder(1)
        .build();
      const inboundRouteAfterConnection = routeBuilder()
        .from('BOG')
        .to('MAD')
        .travelledOn(new Date('2023-06-04'))
        .withDistance(8000)
        .withCarbonFootprint(1200)
        .withType('inbound')
        .withOrder(2)
        .build();

      travelFixture.givenFollowingFlightTravelsExist(
        [flightTravelBuilder()
          .withId(1)
          .withUser('Nicolas')
          .withRoutes([outboundRouteBeforeConnection, outboundRouteAfterConnection, inboundRouteBeforeConnection, inboundRouteAfterConnection])
          .build()
        ]
      );

      await travelFixture.whenUserViewFlightTravelsOf('Nicolas');

      travelFixture.thenUserShouldSee([
        {
          id: 1,
          from: 'MAD',
          to: 'UIO',
          outboundDate: new Date('2023-05-17'),
          outboundConnection: 'AMS',
          inboundConnection: 'BOG',
          inboundDate: new Date('2023-06-04'),
          kgCO2eqTotal: 3020
        }
      ])
    })
  })

  describe('Rule: A user can only see his own flight travels', () => {
    test("Arnaud can see his flight travels but not Nicolas's flight travels", async () => {

      travelFixture.givenFollowingFlightTravelsExist(
        [
          flightTravelBuilder()
            .withId(1)
            .withUser('Arnaud')
            .withRoutes([routeBuilder()
              .withType('outbound')
              .from('BOD')
              .to('DUB')
              .travelledOn(new Date('2023-05-18'))
              .withDistance(1100)
              .withCarbonFootprint(250)
              .build()])
            .build(),
          flightTravelBuilder()
            .withId(2)
            .withUser('Nicolas')
            .withRoutes([routeBuilder()
              .withType('outbound')
              .from('MAD')
              .to('BRU')
              .travelledOn(new Date('2023-05-17'))
              .withDistance(1000)
              .withCarbonFootprint(230)
              .build()])
            .build()
        ]
      );

      await travelFixture.whenUserViewFlightTravelsOf('Arnaud');

      travelFixture.thenUserShouldSee([
        {
          id: 1,
          from: 'BOD',
          to: 'DUB',
          outboundDate: new Date('2023-05-18'),
          kgCO2eqTotal: 250
        }
      ])
    });
  });

  describe('Rule: A user sees his flight travels in reverse chronological order', () => {
    test("Nicolas has 2 flight travels, and when he sees them he sees first the most recent one", async () => {

      travelFixture.givenFollowingFlightTravelsExist(
        [
          flightTravelBuilder()
            .withId(1)
            .withUser('Nicolas')
            .withRoutes([routeBuilder()
              .withType('outbound')
              .from('MAD')
              .to('BRU')
              .travelledOn(new Date('2023-01-23'))
              .withDistance(1316)
              .withCarbonFootprint(234)
              .build()])
            .build(),
          flightTravelBuilder()
            .withId(2)
            .withUser('Nicolas')
            .withRoutes([routeBuilder()
              .withType('outbound')
              .from('TLS')
              .to('DUB')
              .travelledOn(new Date('2023-05-17'))
              .withDistance(1000)
              .withCarbonFootprint(200)
              .build()])
            .build()
        ]
      );

      await travelFixture.whenUserViewFlightTravelsOf('Nicolas');

      travelFixture.thenUserShouldSee([
        {
          id: 2,
          from: 'TLS',
          to: 'DUB',
          outboundDate: new Date('2023-05-17'),
          kgCO2eqTotal: 200
        },
        {
          id: 1,
          from: 'MAD',
          to: 'BRU',
          outboundDate: new Date('2023-01-23'),
          kgCO2eqTotal: 234
        }
      ])
    });

  })
})