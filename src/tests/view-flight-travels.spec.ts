import { flightTravelBuilder, routeBuilder } from "./flight-travel.builder";
import { FlightTravelFixture, createTravelFixture } from "./flight-travel.fixture"

describe("Feature: View carbon footprints for a user's flight travels", () => {
  let fixture: FlightTravelFixture;
  beforeEach(() => {
    fixture = createTravelFixture();
  })

  describe('Rule: A user can see his carbon footprint for all of his flight travels', () => {
    test('Nicolas can see his carbon footprint for a single flight travel with no connection', async () => {
      fixture.givenFollowingFlightTravelsExist(
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

      await fixture.whenUserViewFlightTravelsOf('Nicolas');

      fixture.thenUserShouldSee([
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

      fixture.givenFollowingFlightTravelsExist(
        [flightTravelBuilder()
          .withId(1)
          .withUser('Nicolas')
          .withRoutes([routeBeforeConnection, routeAfterConnection])
          .build()
        ]
      );

      await fixture.whenUserViewFlightTravelsOf('Nicolas');

      fixture.thenUserShouldSee([
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

      fixture.givenFollowingFlightTravelsExist(
        [flightTravelBuilder()
          .withId(1)
          .withUser('Nicolas')
          .withRoutes([outboundRoute, inboundRoute])
          .build()
        ]
      );

      await fixture.whenUserViewFlightTravelsOf('Nicolas');

      fixture.thenUserShouldSee([
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

      fixture.givenFollowingFlightTravelsExist(
        [flightTravelBuilder()
          .withId(1)
          .withUser('Nicolas')
          .withRoutes([outboundRouteBeforeConnection, outboundRouteAfterConnection, inboundRoute])
          .build()
        ]
      );

      await fixture.whenUserViewFlightTravelsOf('Nicolas');

      fixture.thenUserShouldSee([
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

      fixture.givenFollowingFlightTravelsExist(
        [flightTravelBuilder()
          .withId(1)
          .withUser('Nicolas')
          .withRoutes([outboundRoute, inboundRouteBeforeConnection, inboundRouteAfterConnection])
          .build()
        ]
      );

      await fixture.whenUserViewFlightTravelsOf('Nicolas');

      fixture.thenUserShouldSee([
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

      fixture.givenFollowingFlightTravelsExist(
        [flightTravelBuilder()
          .withId(1)
          .withUser('Nicolas')
          .withRoutes([outboundRouteBeforeConnection, outboundRouteAfterConnection, inboundRouteBeforeConnection, inboundRouteAfterConnection])
          .build()
        ]
      );

      await fixture.whenUserViewFlightTravelsOf('Nicolas');

      fixture.thenUserShouldSee([
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
})