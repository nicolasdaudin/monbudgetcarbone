import { Test, TestingModule } from '@nestjs/testing';
import { HttpCode, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { exec } from 'child_process';
import { promisify } from 'util';
import { flightTravelBuilder, routeBuilder } from './tests/flight-travel.builder';
import { PrismaFlightTravelRepository } from './infra/flight-travel.prisma.repository';
import { PrismaClient } from '@prisma/client'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { DEFAULT_ID } from './infra/flight-travel.inmemory.repository';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { NotFoundError } from '@prisma/client/runtime/library';

const asyncExec = promisify(exec);

jest.setTimeout(10000);

describe('AppController (e2e)', () => {
  let app: INestApplication;


  let prismaClient: PrismaClient;
  let container: StartedPostgreSqlContainer;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().withDatabase('mbc-test').withUsername('mbc-test').withPassword('mbc-test').withExposedPorts(5432).start();

    const databaseUrl = `postgresql://mbc-test:mbc-test@${container.getHost()}:${container.getMappedPort(5432)}/mbc-test?schema=public`

    console.log({ databaseUrl });

    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    })

    await asyncExec(`DATABASE_URL=${databaseUrl} npx prisma migrate deploy`);

    await prismaClient.$connect();
  })


  afterAll(async () => {
    await app.close();
    await container.stop();
    await prismaClient.$disconnect();
  });

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaClient)
      .useValue(prismaClient)
      .compile();


    app = moduleFixture.createNestApplication();
    await app.init();

    await prismaClient.route.deleteMany();
    await prismaClient.flightTravel.deleteMany();

  });

  test('GET /', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Bienvenue sur Mon Budget Carbone');
  });

  test('GET /api/flight-travels?user', async () => {
    const flightTravelRepository = new PrismaFlightTravelRepository(prismaClient);

    await flightTravelRepository.add(
      flightTravelBuilder()
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
    )

    expect.assertions(1);
    await request(app.getHttpServer())
      .get('/api/flight-travels?user=Nicolas').expect(200).then(response => {
        expect(response.body).toEqual([
          {
            id: 1,
            from: 'MAD',
            to: 'BRU',
            outboundDate: (new Date('2023-05-17')).toISOString(),
            kgCO2eqTotal: 230
          }
        ])
      })
  })

  test('POST /api/flight-travels (basic single flight)', async () => {
    await request(app.getHttpServer())
      .post('/api/flight-travels')
      .send({
        fromIataCode: 'MAD',
        toIataCode: 'BRU',
        outboundDate: '2023-05-11',
        user: 'Nicolas'
      })
      .expect(201)


    const flightTravelRepository = new PrismaFlightTravelRepository(prismaClient);

    const actualFlightTravels = await flightTravelRepository.getAllOfUser('Nicolas')

    const actualFlightTravel = actualFlightTravels[0];


    expect(actualFlightTravel).toMatchObject(expect.objectContaining({
      user: 'Nicolas',
      routes: [expect.objectContaining({
        from: 'MAD',
        to: 'BRU',
        date: new Date('2023-05-11')
      })]
    }))
  })

  test('POST /api/flight-travels (complex flight with return and connections)', async () => {
    await request(app.getHttpServer())
      .post('/api/flight-travels')
      .send({
        fromIataCode: 'MAD',
        toIataCode: 'UIO',
        outboundDate: '2023-05-11',
        inboundDate: '2023-06-01',
        outboundConnection: 'AMS',
        inboundConnection: 'BOG',
        user: 'Nicolas'
      })
      .expect(201)


    const flightTravelRepository = new PrismaFlightTravelRepository(prismaClient);

    const actualFlightTravels = await flightTravelRepository.getAllOfUser('Nicolas')

    const actualFlightTravel = actualFlightTravels[0];


    expect(actualFlightTravel).toMatchObject(expect.objectContaining({
      user: 'Nicolas',
      routes: [
        expect.objectContaining({
          from: 'MAD',
          to: 'AMS',
          date: new Date('2023-05-11'),
          type: 'outbound',
        }),
        expect.objectContaining({
          from: 'AMS',
          to: 'UIO',
          date: new Date('2023-05-11'),
          type: 'outbound',
        }),
        expect.objectContaining({
          from: 'UIO',
          to: 'BOG',
          date: new Date('2023-06-01'),
          type: 'inbound',
        }),
        expect.objectContaining({
          from: 'BOG',
          to: 'MAD',
          date: new Date('2023-06-01'),
          type: 'inbound',
        })
      ]
    }))
  })

  test('POST /api/flight-travels/:id (basic single flight)', async () => {
    const flightTravelRepository = new PrismaFlightTravelRepository(prismaClient);


    await flightTravelRepository.add(
      flightTravelBuilder()
        .withUser('Nicolas')
        .withRoutes([routeBuilder()
          .from('MAD')
          .to('DUB')
          .travelledOn(new Date('2023-05-10'))
          .build()
        ])
        .build()
    )

    const addedFlightTravelId = (await flightTravelRepository.getAllOfUser('Nicolas'))[0].id;

    await request(app.getHttpServer())
      .post(`/api/flight-travels/${addedFlightTravelId}`)
      .send({
        fromIataCode: 'MAD',
        toIataCode: 'BRU',
        outboundDate: '2023-05-11',
        user: 'Nicolas'
      })
      .expect(201)


    const actualFlightTravel = (await flightTravelRepository.getAllOfUser('Nicolas'))[0]


    expect(actualFlightTravel).toMatchObject(expect.objectContaining({
      id: addedFlightTravelId,
      user: 'Nicolas',
      routes: [expect.objectContaining({
        from: 'MAD',
        to: 'BRU',
        date: new Date('2023-05-11')
      })]
    }))

  })

  test('POST /api/flight-travels/:id (complex flight with return and connections)', async () => {
    const flightTravelRepository = new PrismaFlightTravelRepository(prismaClient);


    await flightTravelRepository.add(
      flightTravelBuilder()
        .withUser('Nicolas')
        .withRoutes([
          routeBuilder()
            .from('MAD')
            .to('DUB')
            .travelledOn(new Date('2023-05-10'))
            .withType('outbound')
            .build(),
          routeBuilder()
            .from('DUB')
            .to('BRU')
            .travelledOn(new Date('2023-05-20'))
            .withType('inbound')
            .withOrder(1)
            .build(),
          routeBuilder()
            .from('BRU')
            .to('MAD')
            .travelledOn(new Date('2023-05-20'))
            .withType('inbound')
            .withOrder(2)
            .build(),
        ])
        .build()
    )

    const addedFlightTravelId = (await flightTravelRepository.getAllOfUser('Nicolas'))[0].id;

    await request(app.getHttpServer())
      .post(`/api/flight-travels/${addedFlightTravelId}`)
      .send({
        fromIataCode: 'MAD',
        toIataCode: 'DUB',
        outboundDate: '2023-05-11',
        inboundDate: '2023-05-21',
        outboundConnection: 'BRU',
        inboundConnection: 'AMS',
        user: 'Nicolas'
      })
      .expect(201)


    const actualFlightTravel = (await flightTravelRepository.getAllOfUser('Nicolas'))[0]


    expect(actualFlightTravel).toMatchObject(expect.objectContaining({
      id: addedFlightTravelId,
      user: 'Nicolas',
      routes: [
        expect.objectContaining({
          from: 'MAD',
          to: 'BRU',
          date: new Date('2023-05-11'),
          type: 'outbound',
        }),
        expect.objectContaining({
          from: 'BRU',
          to: 'DUB',
          date: new Date('2023-05-11'),
          type: 'outbound',
        }),
        expect.objectContaining({
          from: 'DUB',
          to: 'AMS',
          date: new Date('2023-05-21'),
          type: 'inbound',
        }),
        expect.objectContaining({
          from: 'AMS',
          to: 'MAD',
          date: new Date('2023-05-21'),
          type: 'inbound',
        })
      ]
    }))
  })

  test('DELETE /api/flight-travels/:id', async () => {
    const flightTravelRepository = new PrismaFlightTravelRepository(prismaClient);


    await flightTravelRepository.add(
      flightTravelBuilder()
        .withUser('Nicolas')
        .withRoutes([
          routeBuilder()
            .from('MAD')
            .to('DUB')
            .travelledOn(new Date('2023-05-10'))
            .withType('outbound')
            .build()])
        .build());
    await flightTravelRepository.add(
      flightTravelBuilder()
        .withUser('Arnaud')
        .withRoutes([
          routeBuilder()
            .from('BOD')
            .to('BRU')
            .travelledOn(new Date('2023-05-15'))
            .withType('outbound')
            .build()])
        .build());


    const idToDelete = (await flightTravelRepository.getAllOfUser('Arnaud'))[0].id;

    await request(app.getHttpServer())
      .delete(`/api/flight-travels/${idToDelete}`)
      .send()
      .expect(204)


    expect.assertions(1);
    try {
      await flightTravelRepository.getById(idToDelete);
    } catch (err) {
      expect(err.name).toMatch(/NotFoundError/)
    }

  });
});
