import { DEFAULT_ID } from "../infra/flight-travel.inmemory.repository";
import { flightTravelBuilder, routeBuilder } from "./flight-travel.builder";
import { FlightTravelFixture, createTravelFixture } from "./flight-travel.fixture"

describe('Feature: View flight travels', () => {
  let fixture: FlightTravelFixture;
  beforeEach(() => {
    fixture = createTravelFixture();
  })

  describe('Rule: A user can see all of his flight travels', () => {
    test.only('Nicolas can see his single flight with no connection', async () => {
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
  })
})