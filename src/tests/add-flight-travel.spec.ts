import { Airport } from "../application/airport.repository";
import { airportBuilder } from "./airport.builder";
import { flightTravelBuilder, routeBuilder } from "./flight-travel.builder";
import { FlightTravelFixture, createTravelFixture } from "./flight-travel.fixture";

describe('Feature: Add a flight travel', () => {
  let fixture: FlightTravelFixture;
  beforeEach(() => {
    fixture = createTravelFixture();
  })

  describe('Rule: The flight travel should have a departure and arrival airport and can be only outbound', () => {

    test("Nicolas adds a outbound flight travel from Madrid to Brussels to his list of travels", async () => {

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

  describe('Rule: the flight travel can have an outbound and inbound journey', () => {
    test('Nicolas adds a outbound and inbound flight travel from Madrid to Brussels to his list of travels', async () => {
      const airports = [
        airportBuilder().withIataCode('MAD').locatedAt("-3.56264, 40.471926").build(),
        airportBuilder().withIataCode('BRU').locatedAt("4.48443984985, 50.901401519800004").build(),
      ]
      fixture.givenAirportsAre(airports);


      await fixture.whenUserAddsTravel({ id: 1, user: 'Nicolas', fromIataCode: 'MAD', toIataCode: 'BRU', outboundDate: new Date('2023-05-17'), inboundDate: new Date('2023-05-20') });

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

      fixture.thenAddedTravelShouldBe(
        flightTravelBuilder()
          .withId(1)
          .withUser('Nicolas')
          .withRoutes([outboundRoute, inboundRoute])
          .build()
      );
    })
  })

  describe('Rule: a flight travel can have 0 or 1 connections', () => {
    test('Nicolas adds an outbound flight travel from Madrid MAD to Quito UIO with a connection in Amsterdam AMS to his list of travels', async () => {
      const airports = [
        airportBuilder().withIataCode('MAD').locatedAt("-3.56264, 40.471926").build(),
        airportBuilder().withIataCode('AMS').locatedAt("4.76389, 52.308601").build(),
        airportBuilder().withIataCode('UIO').locatedAt("-78.3575, -0.129166666667").build(),

      ]
      fixture.givenAirportsAre(airports);


      await fixture.whenUserAddsTravel({ id: 1, user: 'Nicolas', fromIataCode: 'MAD', toIataCode: 'UIO', outboundDate: new Date('2023-05-17'), outboundConnection: 'AMS' });

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


      fixture.thenAddedTravelShouldBe(
        flightTravelBuilder()
          .withId(1)
          .withUser('Nicolas')
          .withRoutes([routeBeforeConnection, routeAfterConnection])
          .build()
      );

    })

    test('Nicolas adds an outbound and inbound flight travel from Madrid MAD to Quito UIO with an outbound connection in Amsterdam AMS and an inbound connection in Bogota BOG to his list of travels', async () => {
      const airports = [
        airportBuilder().withIataCode('MAD').locatedAt("-3.56264, 40.471926").build(),
        airportBuilder().withIataCode('AMS').locatedAt("4.76389, 52.308601").build(),
        airportBuilder().withIataCode('BOG').locatedAt("-74.1469, 4.70159").build(),
        airportBuilder().withIataCode('UIO').locatedAt("-78.3575, -0.129166666667").build(),


      ]
      fixture.givenAirportsAre(airports);


      await fixture.whenUserAddsTravel({ id: 1, user: 'Nicolas', fromIataCode: 'MAD', toIataCode: 'UIO', outboundDate: new Date('2023-05-17'), outboundConnection: 'AMS', inboundDate: new Date('2023-06-04'), inboundConnection: 'BOG' });

      const outboundRouteBeforeConnection = routeBuilder()
        .from('MAD')
        .to('AMS')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(1461)
        .withCarbonFootprint(260.058)
        .withType('outbound')
        .withOrder(1)
        .build();
      const outboundRouteAfterConnection = routeBuilder()
        .from('AMS')
        .to('UIO')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(9551)
        .withCarbonFootprint(1442.201)
        .withType('outbound')
        .withOrder(2)
        .build();
      const inboundRouteBeforeConnection = routeBuilder()
        .from('UIO')
        .to('BOG')
        .travelledOn(new Date('2023-06-04'))
        .withDistance(710)
        .withCarbonFootprint(163.3)
        .withType('inbound')
        .withOrder(1)
        .build();
      const inboundRouteAfterConnection = routeBuilder()
        .from('BOG')
        .to('MAD')
        .travelledOn(new Date('2023-06-04'))
        .withDistance(8034)
        .withCarbonFootprint(1213.134)
        .withType('inbound')
        .withOrder(2)
        .build();


      fixture.thenAddedTravelShouldBe(
        flightTravelBuilder()
          .withId(1)
          .withUser('Nicolas')
          .withRoutes([outboundRouteBeforeConnection, outboundRouteAfterConnection, inboundRouteBeforeConnection, inboundRouteAfterConnection])
          .build()
      );

    })

    test('Nicolas adds an outbound and inbound flight travel from Madrid MAD to Quito UIO with an outbound connection in Amsterdam AMS and no inbound connection', async () => {
      const airports = [
        airportBuilder().withIataCode('MAD').locatedAt("-3.56264, 40.471926").build(),
        airportBuilder().withIataCode('AMS').locatedAt("4.76389, 52.308601").build(),
        airportBuilder().withIataCode('UIO').locatedAt("-78.3575, -0.129166666667").build(),


      ]
      fixture.givenAirportsAre(airports);


      await fixture.whenUserAddsTravel({ id: 1, user: 'Nicolas', fromIataCode: 'MAD', toIataCode: 'UIO', outboundDate: new Date('2023-05-17'), outboundConnection: 'AMS', inboundDate: new Date('2023-06-04') });

      const outboundRouteBeforeConnection = routeBuilder()
        .from('MAD')
        .to('AMS')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(1461)
        .withCarbonFootprint(260.058)
        .withType('outbound')
        .withOrder(1)
        .build();
      const outboundRouteAfterConnection = routeBuilder()
        .from('AMS')
        .to('UIO')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(9551)
        .withCarbonFootprint(1442.201)
        .withType('outbound')
        .withOrder(2)
        .build();
      const inboundRoute = routeBuilder()
        .from('UIO')
        .to('MAD')
        .travelledOn(new Date('2023-06-04'))
        .withDistance(8738)
        .withCarbonFootprint(1319.438)
        .withType('inbound')
        .build();


      fixture.thenAddedTravelShouldBe(
        flightTravelBuilder()
          .withId(1)
          .withUser('Nicolas')
          .withRoutes([outboundRouteBeforeConnection, outboundRouteAfterConnection, inboundRoute])
          .build()
      );

    })

    test('Nicolas adds an outbound and inbound flight travel from Madrid MAD to Quito UIO with no outbound connection and an inbound connection in Bogota BOG to his list of travels', async () => {
      const airports = [
        airportBuilder().withIataCode('MAD').locatedAt("-3.56264, 40.471926").build(),
        airportBuilder().withIataCode('BOG').locatedAt("-74.1469, 4.70159").build(),
        airportBuilder().withIataCode('UIO').locatedAt("-78.3575, -0.129166666667").build(),


      ]
      fixture.givenAirportsAre(airports);


      await fixture.whenUserAddsTravel({ id: 1, user: 'Nicolas', fromIataCode: 'MAD', toIataCode: 'UIO', outboundDate: new Date('2023-05-17'), inboundDate: new Date('2023-06-04'), inboundConnection: 'BOG' });

      const outboundRoute = routeBuilder()
        .from('MAD')
        .to('UIO')
        .travelledOn(new Date('2023-05-17'))
        .withDistance(8738)
        .withCarbonFootprint(1319.438)
        .withType('outbound')
        .build();
      const inboundRouteBeforeConnection = routeBuilder()
        .from('UIO')
        .to('BOG')
        .travelledOn(new Date('2023-06-04'))
        .withDistance(710)
        .withCarbonFootprint(163.3)
        .withType('inbound')
        .withOrder(1)
        .build();
      const inboundRouteAfterConnection = routeBuilder()
        .from('BOG')
        .to('MAD')
        .travelledOn(new Date('2023-06-04'))
        .withDistance(8034)
        .withCarbonFootprint(1213.134)
        .withType('inbound')
        .withOrder(2)
        .build();


      fixture.thenAddedTravelShouldBe(
        flightTravelBuilder()
          .withId(1)
          .withUser('Nicolas')
          .withRoutes([outboundRoute, inboundRouteBeforeConnection, inboundRouteAfterConnection])
          .build()
      );

    })



  })
});


