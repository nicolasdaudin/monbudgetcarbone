import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { FlightTravelRepository } from './application/flight-travel.repository';
import { DEFAULT_ID, InMemoryFlightTravelRepository } from './infra/flight-travel.inmemory.repository';
import { flightTravelBuilder, routeBuilder } from './tests/flight-travel.builder';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  let moduleFixture: TestingModule;
  let flightTravelRepository = new InMemoryFlightTravelRepository();

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FlightTravelRepository)
      .useValue(flightTravelRepository)
      .compile();


    app = moduleFixture.createNestApplication();
    await app.init();
  });

  test('GET /', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Bienvenue sur Mon Budget Carbone');
  });

  test('GET /flight-travel', async () => {
    flightTravelRepository.givenExistingFlightTravels(
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
      ])

    expect.assertions(1);
    await request(app.getHttpServer())
      .get('/flight-travel?user=Nicolas').expect(200).then(response => {
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

  test('POST /flight-travel', async () => {
    await request(app.getHttpServer())
      .post('/flight-travel')
      .send({
        fromIataCode: 'MAD',
        toIataCode: 'BRU',
        outboundDate: '2023-05-11',
        user: 'Nicolas'
      })
      .expect(201)



    const actualFlightTravel = await flightTravelRepository.getById(DEFAULT_ID);

    expect(actualFlightTravel.user).toEqual('Nicolas');
    expect(actualFlightTravel.routes[0].from).toEqual('MAD');
    expect(actualFlightTravel.routes[0].to).toEqual('BRU');
    expect(actualFlightTravel.routes[0].date).toEqual(new Date('2023-05-11'));
  })


});
