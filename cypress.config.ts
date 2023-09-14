import { PrismaClient } from "@prisma/client";
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      on('task', {
        'db:seed': async () => {


          const databaseUrl = process.env.DATABASE_URL;
          console.log({ databaseUrl });


          let prismaClient = new PrismaClient({
            datasources: {
              db: {
                url: databaseUrl
              }
            }
          })

          await prismaClient.$connect();

          // const testData = await prismaClient.flightTravel.findMany({ include: { routes: true } })
          // console.log({ testData });

          const TEST_USER_CYPRESS = 'test-user-cypress'

          const idsToDelete = (await prismaClient.flightTravel.findMany({ where: { user: TEST_USER_CYPRESS } })).map(r => r.id);

          const deleteRoutes = prismaClient.route.deleteMany({
            where: {
              flightTravelId: { in: idsToDelete }
            }
          });
          const deleteFlightTravels = prismaClient.flightTravel.deleteMany({
            where: {
              id: { in: idsToDelete }
            },
          });
          await prismaClient.$transaction([deleteRoutes, deleteFlightTravels]);

          await prismaClient.flightTravel.create({
            data: {
              user: TEST_USER_CYPRESS,
              routes: {
                create: [
                  {
                    type: 'outbound',
                    from: 'MAD',
                    to: 'AMS',
                    date: new Date('2023-09-10'),
                    distance: 1500,
                    kgCO2eq: 257
                  },
                  {
                    type: 'outbound',
                    from: 'AMS',
                    to: 'UIO',
                    date: new Date('2023-09-10'),
                    distance: 9000,
                    kgCO2eq: 1054
                  },
                  {
                    type: 'inbound',
                    from: 'UIO',
                    to: 'BOG',
                    date: new Date('2023-09-25'),
                    distance: 800,
                    kgCO2eq: 150
                  },
                  {
                    type: 'inbound',
                    from: 'BOG',
                    to: 'MAD',
                    date: new Date('2023-09-25'),
                    distance: 8000,
                    kgCO2eq: 998
                  },
                ]
              }
            }
          })

          await prismaClient.flightTravel.create({
            data: {
              user: TEST_USER_CYPRESS,
              routes: {
                create: [
                  {
                    type: 'outbound',
                    from: 'MAD',
                    to: 'AMS',
                    date: new Date('2023-09-01'),
                    distance: 678,
                    kgCO2eq: 123
                  },
                  {
                    type: 'outbound',
                    from: 'AMS',
                    to: 'UIO',
                    date: new Date('2023-09-01'),
                    distance: 8000,
                    kgCO2eq: 1054
                  },
                ]
              }
            }
          })

          await prismaClient.flightTravel.create({
            data: {
              user: TEST_USER_CYPRESS,
              routes: {
                create: [
                  {
                    type: 'outbound',
                    from: 'CDG',
                    to: 'DUB',
                    date: new Date('2023-09-03'),
                    distance: 567,
                    kgCO2eq: 124
                  }
                ]
              }
            }
          })

          return null;
        }
      });// implement node event listeners here
    }
  },
});
