import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';
import { StartedPostgreSqlContainer, PostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaFlightTravelRepository } from '../../../infra/flight-travel.prisma.repository';
import { flightTravelBuilder, routeBuilder } from '../../../tests/flight-travel.builder';
import { FlightTravelsApiModule } from './flight-travels.api.module';


const asyncExec = promisify(exec);

jest.setTimeout(10000);

describe.only('FlightTravelApiController (e2e)', () => {
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
      imports: [FlightTravelsApiModule],
    })
      .overrideProvider(PrismaClient)
      .useValue(prismaClient)
      .compile();


    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true
    }));

    await app.init();

    await prismaClient.route.deleteMany();
    await prismaClient.flightTravel.deleteMany();

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
            from: expect.objectContaining({ iataCode: 'MAD' }),
            to: expect.objectContaining({ iataCode: 'BRU' }),
            outboundDate: (new Date('2023-05-17')).toISOString(),
            kgCO2eqTotal: 230
          }
        ])
      })
  })

  test('POST /api/flight-travels - creates a basic single flight', async () => {
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

  test('POST /api/flight-travels - tries to create a basic single flight and fails when one required param is missing', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/flight-travels')
      .send({
        fromIataCode: 'MAD',
        user: 'Nicolas'
      })
      .expect(400);

    expect(res.body.message).toEqual(
      expect.arrayContaining([
        expect.stringContaining('toIataCode'),
        expect.stringContaining('outboundDate')
      ])
    );
  });

  test('POST /api/flight-travels - tries to create a basic single flight and fails when one of the airports is not found', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/flight-travels')
      .send({
        fromIataCode: 'MAD',
        toIataCode: 'BRU',
        outboundConnection: 'XXX',
        outboundDate: '2023-05-11',
        user: 'Nicolas'
      })
      .expect(400);

    expect(res.body.message).toEqual('Airport with iata code XXX not found');

  });




  test('POST /api/flight-travels - creates a complex flight with return and connections', async () => {
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

  test('PUT /api/flight-travels/:id - edits a basic single flight', async () => {
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

    const addedFlightTravel = (await flightTravelRepository.getAllOfUser('Nicolas'))[0]
    const addedFlightTravelId = addedFlightTravel.id;


    await request(app.getHttpServer())
      .put(`/api/flight-travels/${addedFlightTravelId}`)
      .send({
        fromIataCode: 'MAD',
        toIataCode: 'BRU',
        outboundDate: '2023-05-11',
        user: 'Nicolas'
      })
      .expect(200)


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

  test('PUT /api/flight-travels/:id - tries to edit a basic single flight and fails when the id does not exist', async () => {

    const addedFlightTravelId = 43587878;

    const res = await request(app.getHttpServer())
      .put(`/api/flight-travels/${addedFlightTravelId}`)
      .send({
        fromIataCode: 'MAD',
        toIataCode: 'BRU',
        outboundDate: '2023-05-11',
        user: 'Nicolas'
      })
      .expect(404)

    expect(res.body.message).toEqual(expect.stringContaining(addedFlightTravelId.toString()));
  })

  test('PUT /api/flight-travels/:id - tries to edit a basic single flight and fails when one of the airport does not exist', async () => {
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

    const addedFlightTravel = (await flightTravelRepository.getAllOfUser('Nicolas'))[0]
    const addedFlightTravelId = addedFlightTravel.id;

    const res = await request(app.getHttpServer())
      .put(`/api/flight-travels/${addedFlightTravelId}`)
      .send({
        fromIataCode: 'MAD',
        toIataCode: 'XXX',
        outboundDate: '2023-05-11',
        user: 'Nicolas'
      })
      .expect(400)

    expect(res.body.message).toEqual('Airport with iata code XXX not found');

  });



  test('PUT /api/flight-travels/:id - edits a complex flight with return and connections', async () => {
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
      .put(`/api/flight-travels/${addedFlightTravelId}`)
      .send({
        fromIataCode: 'MAD',
        toIataCode: 'DUB',
        outboundDate: '2023-05-11',
        inboundDate: '2023-05-21',
        outboundConnection: 'BRU',
        inboundConnection: 'AMS',
        user: 'Nicolas'
      }).expect(200);

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

  test('PUT /api/flight-travels/:id - edits a complex flight with return and connections and make it simple i.e. outbound and no connections', async () => {
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
      .put(`/api/flight-travels/${addedFlightTravelId}`)
      .send({
        fromIataCode: 'MAD',
        toIataCode: 'BRU',
        outboundDate: '2023-05-11'
      }).expect(200);

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
        })
      ]
    }))
  })

  test('DELETE /api/flight-travels/:id - deletes a flight', async () => {
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


    const flightTravel = await flightTravelRepository.getById(idToDelete);
    expect(flightTravel).toBeNull();

  });

  test('DELETE /api/flight-travels/:id - tries to delete a flight that does not exist', async () => {
    const idToDelete = 533424;

    const res = await request(app.getHttpServer())
      .delete(`/api/flight-travels/${idToDelete}`)
      .send()
      .expect(404)

    expect(res.body.message).toEqual(expect.stringContaining(idToDelete.toString()));
  });
});
