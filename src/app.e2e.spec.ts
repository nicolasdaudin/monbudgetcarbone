import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { exec } from 'child_process';
import { promisify } from 'util';
import { flightTravelBuilder, routeBuilder } from './tests/flight-travel.builder';
import { PrismaFlightTravelRepository } from './infra/flight-travel.prisma.repository';
import { PrismaClient } from '@prisma/client'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'

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

  test('POST /api/flight-travels', async () => {
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

    expect(actualFlightTravel.user).toEqual('Nicolas');
    expect(actualFlightTravel.routes[0].from).toEqual('MAD');
    expect(actualFlightTravel.routes[0].to).toEqual('BRU');
    expect(actualFlightTravel.routes[0].date).toEqual(new Date('2023-05-11'));
  })
});
