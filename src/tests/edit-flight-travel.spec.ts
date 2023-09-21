import { airportBuilder } from "./airport.builder";
import { FlightTravelFixture, createTravelFixture } from "./flight-travel.fixture";
import { flightTravelBuilder, routeBuilder } from "./flight-travel.builder";
import { DEFAULT_ID } from "../infra/flight-travel.inmemory.repository";
import { FlightTravelNotFound } from "../application/exceptions/flight-travel.exceptions";

describe('Feature: Edit a flight travel and calculate again its corresponding carboon footprint', () => {
  let fixture: FlightTravelFixture;
  beforeEach(() => {
    fixture = createTravelFixture();
  })

  describe('Rule: We can not edit a flight travel that does not exist', () => {
    test("Nicolas tries to edit a flight travel that does not exist, an error is thrown", async () => {
      await fixture.whenUserEditsTravel({ id: DEFAULT_ID, user: 'Nicolas', fromIataCode: 'MAD', toIataCode: 'DUB', outboundDate: new Date('2023-05-19') });

      await fixture.thenErrorShouldBe(FlightTravelNotFound);
    })
  });
  describe('Rule: An edited flight travel can have a departure and arrival airport and can be outbound only. A carbon footprint should be recalculated', () => {

    test("Nicolas edits an existing outbound flight travel with no connections and carbon footprint is calculated again", async () => {

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

  describe("Rule: The carbon footprint of an edited flight travel should be recalculated like this: 0.230kgCO2/km for flights less than 1000 km, 0.178kgCO2/km for flights between 1000 and 3500 km, and 0.151kgCO2/km for flights over 3500 km", () => {

    const airports = [
      airportBuilder().withIataCode('AAA').build(),
      airportBuilder().withIataCode('BBB').build(),
      airportBuilder().withIataCode('CCC').build()
    ]
    const baseFlightTravelBuilder = flightTravelBuilder()
      .withDefaultId()
      .withUser('Nicolas')

    const baseRouteBuilder = routeBuilder()
      .from('AAA')
      .to('BBB')
      .travelledOn(new Date('2023-05-17'))

    const editedRouteBuilder = routeBuilder()
      .from('AAA')
      .to('CCC')
      .travelledOn(new Date('2023-05-17'))

    test("Nicolas edits a flight travel and now it's a 999 km flight travel. Carbon footprint is updated as expected.", async () => {


      fixture.givenAirportsAre(airports);
      fixture.givenDistanceBetweenAirportsIs(999);

      const existingFlightTravel = flightTravelBuilder()
        .withDefaultId()
        .withUser('Nicolas')
        .withRoutes([baseRouteBuilder.build()])
        .build();


      fixture.givenFollowingFlightTravelsExist([existingFlightTravel])

      await fixture.whenUserEditsTravel({
        id: DEFAULT_ID,
        user: 'Nicolas',
        fromIataCode: 'AAA',
        toIataCode: 'CCC',
        outboundDate: new Date('2023-05-17')
      });


      fixture.thenAddedTravelShouldBe(
        baseFlightTravelBuilder
          .withRoutes([editedRouteBuilder
            .withDistance(999)
            .withCarbonFootprint(229.77)
            .build()])
          .build()
      );
    });

    test("Nicolas edits a flight travel and now it's a 1000 km flight travel. Carbon footprint is updated as expected.", async () => {


      fixture.givenAirportsAre(airports);
      fixture.givenDistanceBetweenAirportsIs(1000);

      const existingFlightTravel = flightTravelBuilder()
        .withDefaultId()
        .withUser('Nicolas')
        .withRoutes([baseRouteBuilder.build()])
        .build();


      fixture.givenFollowingFlightTravelsExist([existingFlightTravel])

      await fixture.whenUserEditsTravel({
        id: DEFAULT_ID,
        user: 'Nicolas',
        fromIataCode: 'AAA',
        toIataCode: 'CCC',
        outboundDate: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe(
        baseFlightTravelBuilder
          .withRoutes([editedRouteBuilder
            .withDistance(1000)
            .withCarbonFootprint(178)
            .build()])
          .build()
      );
    });

    test("Nicolas edits a flight travel and now it's a 3499 km flight travel. Carbon footprint is updated as expected.", async () => {


      fixture.givenAirportsAre(airports);
      fixture.givenDistanceBetweenAirportsIs(3499);

      const existingFlightTravel = flightTravelBuilder()
        .withDefaultId()
        .withUser('Nicolas')
        .withRoutes([baseRouteBuilder.build()])
        .build();


      fixture.givenFollowingFlightTravelsExist([existingFlightTravel])

      await fixture.whenUserEditsTravel({
        id: DEFAULT_ID,
        user: 'Nicolas',
        fromIataCode: 'AAA',
        toIataCode: 'CCC',
        outboundDate: new Date('2023-05-17')
      });

      fixture.thenAddedTravelShouldBe(
        baseFlightTravelBuilder
          .withRoutes([editedRouteBuilder
            .withDistance(3499)
            .withCarbonFootprint(622.822)
            .build()])
          .build()
      );
    });

    test("Nicolas edits a flight travel and now it's a 3500 km flight travel. Carbon footprint is updated as expected.", async () => {


      fixture.givenAirportsAre(airports);
      fixture.givenDistanceBetweenAirportsIs(3500);

      const existingFlightTravel = flightTravelBuilder()
        .withDefaultId()
        .withUser('Nicolas')
        .withRoutes([baseRouteBuilder.build()])
        .build();


      fixture.givenFollowingFlightTravelsExist([existingFlightTravel])

      await fixture.whenUserEditsTravel({
        id: DEFAULT_ID,
        user: 'Nicolas',
        fromIataCode: 'AAA',
        toIataCode: 'CCC',
        outboundDate: new Date('2023-05-17')
      });


      fixture.thenAddedTravelShouldBe(
        baseFlightTravelBuilder
          .withRoutes([editedRouteBuilder
            .withDistance(3500)
            .withCarbonFootprint(528.5)
            .build()])
          .build()
      );
    });
  })

  describe('Rule: An edited flight travel can be outbound and inbound. A carbon footprint should be recalculated', () => {
    test("Nicolas edits an existing outbound flight travel with no connections and now it's an outbound and inbound flight travel. Carbon footprint is calculated again", async () => {
      const airports = [
        airportBuilder().withIataCode('MAD').locatedAt("-3.56264, 40.471926").build(),
        airportBuilder().withIataCode('BRU').locatedAt("4.48443984985, 50.901401519800004").build(),
      ]
      fixture.givenAirportsAre(airports);

      const outboundRoute = routeBuilder()
        .from('MAD')
        .to('BRU')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(1316)
        .withCarbonFootprint(234.248)
        .withType('outbound')
        .build()
      const inboundRoute = routeBuilder()
        .from('BRU')
        .to('MAD')
        .travelledOn(new Date('2023-05-20'))
        .withDistance(1316)
        .withCarbonFootprint(234.248)
        .withType('inbound')
        .build()

      const existingFlightTravel = flightTravelBuilder()
        .withDefaultId()
        .withUser('Nicolas')
        .withRoutes([outboundRoute])
        .build();


      fixture.givenFollowingFlightTravelsExist([
        existingFlightTravel
      ])

      await fixture.whenUserEditsTravel({ id: DEFAULT_ID, user: 'Nicolas', fromIataCode: 'MAD', toIataCode: 'BRU', outboundDate: new Date('2023-05-17'), inboundDate: new Date('2023-05-20') });

      fixture.thenAddedTravelShouldBe(
        flightTravelBuilder()
          .withDefaultId()
          .withUser('Nicolas')
          .withRoutes([outboundRoute, inboundRoute])
          .build()
      )
    });
  });

  describe('Rule: An edited flight travel can have connections. A carbon footprint should be recalculated', () => {
    test("Nicolas edits an existing outbound flight travel with no connections and now it's an outbound flight travel with a connection. Carbon footprint is calculated again", async () => {
      const airports = [
        airportBuilder().withIataCode('MAD').locatedAt("-3.56264, 40.471926").build(),
        airportBuilder().withIataCode('AMS').locatedAt("4.76389, 52.308601").build(),
        airportBuilder().withIataCode('UIO').locatedAt("-78.3575, -0.129166666667").build(),
      ]
      fixture.givenAirportsAre(airports);

      const routeWithoutConnection = routeBuilder()
        .from('MAD')
        .to('UIO')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(9000)
        .withCarbonFootprint(1359.123)
        .withType('outbound')
        .build();

      const routeBeforeConnection = routeBuilder()
        .from('MAD')
        .to('AMS')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(1461)
        .withCarbonFootprint(260.058)
        .withType('outbound')
        .withOrder(1)
        .build();
      const routeAfterConnection = routeBuilder()
        .from('AMS')
        .to('UIO')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(9551)
        .withCarbonFootprint(1442.201)
        .withType('outbound')
        .withOrder(2)
        .build();

      const existingFlightTravel = flightTravelBuilder()
        .withDefaultId()
        .withUser('Nicolas')
        .withRoutes([routeWithoutConnection])
        .build();


      fixture.givenFollowingFlightTravelsExist([
        existingFlightTravel
      ])

      await fixture.whenUserEditsTravel({ id: DEFAULT_ID, user: 'Nicolas', fromIataCode: 'MAD', toIataCode: 'UIO', outboundDate: new Date('2023-05-17'), outboundConnection: 'AMS' });

      fixture.thenAddedTravelShouldBe(
        flightTravelBuilder()
          .withDefaultId()
          .withUser('Nicolas')
          .withRoutes([routeBeforeConnection, routeAfterConnection])
          .build()
      )
    });

    test("Nicolas edits an existing return flight travel with connections and now it's an outbound flight travel with NO connections. Carbon footprint is calculated again", async () => {
      const airports = [
        airportBuilder().withIataCode('MAD').locatedAt("-3.56264, 40.471926").build(),
        airportBuilder().withIataCode('AMS').locatedAt("4.76389, 52.308601").build(),
        airportBuilder().withIataCode('UIO').locatedAt("-78.3575, -0.129166666667").build(),
        airportBuilder().withIataCode('BRU').locatedAt("4.48443984985, 50.901401519800004").build(),
      ]
      fixture.givenAirportsAre(airports);



      const routeOutboundBeforeConnection = routeBuilder()
        .from('MAD')
        .to('AMS')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(1461)
        .withCarbonFootprint(260.058)
        .withType('outbound')
        .withOrder(1)
        .build();
      const routeOutboundAfterConnection = routeBuilder()
        .from('AMS')
        .to('UIO')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(9551)
        .withCarbonFootprint(1442.201)
        .withType('outbound')
        .withOrder(2)
        .build();
      const routeInboundWithoutConnection = routeBuilder()
        .from('UIO')
        .to('MAD')
        .travelledOn(new Date('2023-05-28'))
        .withDistance(9100)
        .withCarbonFootprint(1300)
        .withType('inbound')
        .build();

      const routeWithoutConnection = routeBuilder()
        .from('MAD')
        .to('UIO')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(8738)
        .withCarbonFootprint(1319.438)
        .withType('outbound')
        .build();

      const existingFlightTravel = flightTravelBuilder()
        .withDefaultId()
        .withUser('Nicolas')
        .withRoutes([routeOutboundBeforeConnection, routeOutboundAfterConnection, routeInboundWithoutConnection])
        .build();


      fixture.givenFollowingFlightTravelsExist([
        existingFlightTravel
      ])

      await fixture.whenUserEditsTravel({ id: DEFAULT_ID, user: 'Nicolas', fromIataCode: 'MAD', toIataCode: 'UIO', outboundDate: new Date('2023-05-17') });

      fixture.thenAddedTravelShouldBe(
        flightTravelBuilder()
          .withDefaultId()
          .withUser('Nicolas')
          .withRoutes([routeWithoutConnection])
          .build()
      )
    });
  });
});