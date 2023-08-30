import { PrismaClient } from '@prisma/client'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaFlightTravelRepository } from '../flight-travel.prisma.repository';
import { flightTravelBuilder, routeBuilder } from '../../tests/flight-travel.builder';

const asyncExec = promisify(exec);

jest.setTimeout(10000);

describe('PrismaFlightTravelRepository', () => {

  let prismaClient: PrismaClient;
  let container: StartedPostgreSqlContainer;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().withDatabase('mbc-test').withUsername('mbc-test').withPassword('mbc-test').withExposedPorts(5432).start();

    const databaseUrl = `postgresql://mbc-test:mbc-test@${container.getHost()}:${container.getMappedPort(5432)}/mbc-test?schema=public`

    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    });

    await asyncExec(`DATABASE_URL=${databaseUrl} npx prisma migrate deploy`);

    await prismaClient.$connect();
  })

  beforeEach(async () => {
    await prismaClient.route.deleteMany();
    await prismaClient.flightTravel.deleteMany();
  })

  afterAll(async () => {
    await container.stop();
    await prismaClient.$disconnect();
  });

  test('add() adds a single way flight travel in database', async () => {
    const flightTravelRepository = new PrismaFlightTravelRepository(prismaClient);

    await flightTravelRepository.add(
      flightTravelBuilder().withUser('Nicolas').withRoutes([
        routeBuilder()
          .from('MAD')
          .to('BRU')
          .travelledOn(new Date('2023-05-17'))
          .withCarbonFootprint(123)
          .build()
      ]).build()
    )

    const actualFlightTravel = await prismaClient.flightTravel.findFirst({
      where: { user: 'Nicolas' },
      include: { routes: true }
    })

    expect(actualFlightTravel).toMatchObject(expect.objectContaining(
      {
        user: 'Nicolas',
        routes: [
          expect.objectContaining({
            from: 'MAD',
            to: 'BRU',
            date: new Date('2023-05-17'),
            kgCO2eq: 123
          })]
      }
    ));
  })

  test('add() adds in database a return flight travel with connections ', async () => {
    const flightTravelRepository = new PrismaFlightTravelRepository(prismaClient);

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

    await flightTravelRepository.add(
      flightTravelBuilder().withUser('Nicolas').withRoutes([
        outboundRouteBeforeConnection, outboundRouteAfterConnection, inboundRouteBeforeConnection, inboundRouteAfterConnection]).build()
    )

    const actualFlightTravel = await prismaClient.flightTravel.findFirst({
      where: { user: 'Nicolas' },
      include: { routes: true }
    })

    expect(actualFlightTravel).toMatchObject(expect.objectContaining(
      {
        user: 'Nicolas',
        routes: [
          expect.objectContaining({
            from: 'MAD',
            to: 'AMS',
            date: new Date('2023-05-17'),
            kgCO2eq: 260.058
          }),
          expect.objectContaining({
            from: 'AMS',
            to: 'UIO',
            date: new Date('2023-05-17'),
            kgCO2eq: 1442.201
          }),
          expect.objectContaining({
            from: 'UIO',
            to: 'BOG',
            date: new Date('2023-06-04'),
            kgCO2eq: 163.3
          }),
          expect.objectContaining({
            from: 'BOG',
            to: 'MAD',
            date: new Date('2023-06-04'),
            kgCO2eq: 1213.134
          }),
        ]
      }
    ));
  })

  test('edit() edits a single way flight travel in database', async () => {

    const id = 4241;

    await prismaClient.flightTravel.create({
      data: {
        id,
        user: 'Nicolas',
        routes: {
          create: [{
            from: 'MAD',
            to: 'BRU',
            date: new Date('2023-05-17'),
            kgCO2eq: 120,
            type: 'outbound',
            distance: 1000
          }]
        }
      }
    })

    const flightTravelRepository = new PrismaFlightTravelRepository(prismaClient);

    await flightTravelRepository.edit(
      flightTravelBuilder()
        .withId(id)
        .withUser('Nicolas')
        .withRoutes([
          routeBuilder()
            .from('MAD')
            .to('DUB')
            .travelledOn(new Date('2023-05-18'))
            .withCarbonFootprint(100)
            .build()
        ]).build()
    )

    const actualFlightTravel = await prismaClient.flightTravel.findUnique({
      where: { id },
      include: { routes: true }
    })

    expect(actualFlightTravel).toMatchObject(expect.objectContaining(
      {
        user: 'Nicolas',
        routes: [
          expect.objectContaining({
            from: 'MAD',
            to: 'DUB',
            date: new Date('2023-05-18'),
            kgCO2eq: 100
          })]
      }
    ));
  });

  test('edit() edits in database a return flight travel with connections ', async () => {

    const id = 32451;

    await prismaClient.flightTravel.create({
      data: {
        id,
        user: 'Nicolas',
        routes: {
          create: [{
            from: 'MAD',
            to: 'AMS',
            date: new Date('2023-05-17'),
            kgCO2eq: 260,
            type: 'outbound',
            distance: 1461
          }, {
            from: 'AMS',
            to: 'UIO',
            date: new Date('2023-05-17'),
            kgCO2eq: 1442,
            type: 'outbound',
            distance: 9551
          },
          {
            from: 'UIO',
            to: 'BOG',
            date: new Date('2023-06-04'),
            kgCO2eq: 700,
            type: 'inbound',
            distance: 160
          },
          {
            from: 'BOG',
            to: 'MAD',
            date: new Date('2023-06-04'),
            kgCO2eq: 1200,
            type: 'inbound',
            distance: 8000
          }

          ]
        }
      }
    })

    const flightTravelRepository = new PrismaFlightTravelRepository(prismaClient);




    const outboundRouteBeforeConnection = routeBuilder()
      .from('UIO')
      .to('AMS')
      .travelledOn(new Date('2023-05-18'))
      .withDistance(9551)
      .withCarbonFootprint(1442.201)
      .withType('outbound')
      .withOrder(1)
      .build();
    const outboundRouteAfterConnection = routeBuilder()
      .from('AMS')
      .to('MAD')
      .travelledOn(new Date('2023-05-18'))
      .withDistance(1461)
      .withCarbonFootprint(260.058)
      .withType('outbound')
      .withOrder(2)
      .build();
    const inboundRouteBeforeConnection = routeBuilder()
      .from('MAD')
      .to('BOG')
      .travelledOn(new Date('2023-06-14'))
      .withDistance(8000)
      .withCarbonFootprint(1200)
      .withType('inbound')
      .withOrder(1)
      .build();
    const inboundRouteAfterConnection = routeBuilder()
      .from('BOG')
      .to('UIO')
      .travelledOn(new Date('2023-06-14'))
      .withDistance(710)
      .withCarbonFootprint(163)
      .withType('inbound')
      .withOrder(2)
      .build();

    await flightTravelRepository.edit(
      flightTravelBuilder()
        .withId(id)
        .withUser('Nicolas')
        .withRoutes([
          outboundRouteBeforeConnection, outboundRouteAfterConnection, inboundRouteBeforeConnection, inboundRouteAfterConnection]).build()
    )


    const actualFlightTravel = await prismaClient.flightTravel.findFirst({
      where: { user: 'Nicolas' },
      include: { routes: true }
    })

    console.log({ actualFlightTravel });
    console.log('routes', actualFlightTravel.routes)
    expect(actualFlightTravel).toMatchObject(expect.objectContaining(
      {
        user: 'Nicolas',
        routes: [
          expect.objectContaining({
            from: 'UIO',
            to: 'AMS',
            date: new Date('2023-05-18'),
            kgCO2eq: 1442.201
          }),
          expect.objectContaining({
            from: 'AMS',
            to: 'MAD',
            date: new Date('2023-05-18'),
            kgCO2eq: 260.058
          }),
          expect.objectContaining({
            from: 'MAD',
            to: 'BOG',
            date: new Date('2023-06-14'),
            kgCO2eq: 1200
          }),
          expect.objectContaining({
            from: 'BOG',
            to: 'UIO',
            date: new Date('2023-06-14'),
            kgCO2eq: 163
          }),
        ]
      }
    ));
  })

  test('getById() returns the correct Flight Travel', async () => {

    const id = 365;

    await prismaClient.flightTravel.create({
      data: {
        id,
        user: 'Nicolas',
        routes: {
          create: [{
            from: 'MAD',
            to: 'BRU',
            date: new Date('2023-05-17'),
            kgCO2eq: 120,
            type: 'outbound',
            distance: 1000
          }]
        }
      }
    })


    const flightTravelRepository = new PrismaFlightTravelRepository(prismaClient);


    const actualFlightTravel = await flightTravelRepository.getById(id);

    expect(actualFlightTravel).toEqual(
      flightTravelBuilder()
        .withId(id)
        .withUser('Nicolas')
        .withRoutes([
          routeBuilder()
            .from('MAD')
            .to('BRU')
            .travelledOn(new Date('2023-05-17'))
            .withDistance(1000)
            .withCarbonFootprint(120)
            .withType('outbound')
            .build()]
        )
        .build()
    )


  })

  test('getAllOfUser() returns all the flight travels for that user', async () => {


    await prismaClient.flightTravel.create({
      data: {
        id: 1,
        user: 'Nicolas',
        routes: {
          create: [{
            from: 'MAD',
            to: 'BRU',
            date: new Date('2023-05-17'),
            kgCO2eq: 120,
            type: 'outbound',
            distance: 1000
          }]
        }
      }
    })

    await prismaClient.flightTravel.create({
      data: {
        id: 2,
        user: 'Nicolas',
        routes: {
          create: [{
            from: 'MAD',
            to: 'TLS',
            date: new Date('2023-12-23'),
            kgCO2eq: 90,
            type: 'outbound',
            distance: 600
          }]
        }
      }
    })
    await prismaClient.flightTravel.create({
      data: {
        id: 3,
        user: 'Arnaud',
        routes: {
          create: [{
            from: 'BOD',
            to: 'DUB',
            date: new Date('2022-12-09'),
            kgCO2eq: 130,
            type: 'outbound',
            distance: 1100
          }]
        }
      }
    })

    const flightTravelRepository = new PrismaFlightTravelRepository(prismaClient);


    const actualFlightTravels = await flightTravelRepository.getAllOfUser('Nicolas');

    expect(actualFlightTravels).toHaveLength(2);

    expect(actualFlightTravels).toEqual(
      [flightTravelBuilder()
        .withId(1)
        .withUser('Nicolas')
        .withRoutes([
          routeBuilder()
            .from('MAD')
            .to('BRU')
            .travelledOn(new Date('2023-05-17'))
            .withDistance(1000)
            .withCarbonFootprint(120)
            .withType('outbound')
            .build()]
        )
        .build(),
      flightTravelBuilder()
        .withId(2)
        .withUser('Nicolas')
        .withRoutes([
          routeBuilder()
            .from('MAD')
            .to('TLS')
            .travelledOn(new Date('2023-12-23'))
            .withDistance(600)
            .withCarbonFootprint(90)
            .withType('outbound')
            .build()]
        )
        .build()
      ]
    )
  })

  test('delete() deletes a travel from the list of travels of a given user', async () => {
    await prismaClient.flightTravel.create({
      data: {
        id: 1,
        user: 'Nicolas',
        routes: {
          create: [{
            from: 'MAD',
            to: 'BRU',
            date: new Date('2023-05-17'),
            kgCO2eq: 120,
            type: 'outbound',
            distance: 1000
          }]
        }
      }
    })

    await prismaClient.flightTravel.create({
      data: {
        id: 2,
        user: 'Nicolas',
        routes: {
          create: [{
            from: 'MAD',
            to: 'TLS',
            date: new Date('2023-12-23'),
            kgCO2eq: 90,
            type: 'outbound',
            distance: 600
          }]
        }
      }
    })
    await prismaClient.flightTravel.create({
      data: {
        id: 3,
        user: 'Arnaud',
        routes: {
          create: [{
            from: 'BOD',
            to: 'DUB',
            date: new Date('2022-12-09'),
            kgCO2eq: 130,
            type: 'outbound',
            distance: 1100
          }]
        }
      }
    })

    const flightTravelRepository = new PrismaFlightTravelRepository(prismaClient);


    const ID_TO_BE_DELETED = 3;
    await flightTravelRepository.deleteById(ID_TO_BE_DELETED);

    const flightTravelThatShouldBeDeleted = await prismaClient.flightTravel.findUnique({ where: { id: ID_TO_BE_DELETED } })
    expect(flightTravelThatShouldBeDeleted).toBeNull();

    const nbOfRemainingTravels = await prismaClient.flightTravel.count();
    expect(nbOfRemainingTravels).toBe(2);

  })
})