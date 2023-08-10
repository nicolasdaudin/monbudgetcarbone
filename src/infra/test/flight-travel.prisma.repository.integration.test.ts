import { PrismaClient } from '@prisma/client'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaFlightTravelRepository } from '../flight-travel.prisma.repository';
import { flightTravelBuilder, routeBuilder } from '../../tests/flight-travel.builder';

const asyncExec = promisify(exec);

jest.setTimeout(10000);

describe.only('PrismaFlightTravelRepository', () => {

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

  test('add() adds a travel in database', async () => {
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

    console.log({ actualFlightTravel });
    console.log('routes', actualFlightTravel.routes)
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
})