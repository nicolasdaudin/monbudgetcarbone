import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { FlightTravelRepository } from './application/flight-travel.repository';
import { DEFAULT_ID } from './infra/flight-travel.inmemory.repository';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  let moduleFixture: TestingModule;

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();


    app = moduleFixture.createNestApplication();
    await app.init();
  });

  test('GET /', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Bienvenue sur Mon Budget Carbone');
  });

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


    const flightTravelRepository = moduleFixture.get(FlightTravelRepository);

    const actualFlightTravel = await flightTravelRepository.getById(DEFAULT_ID);

    expect(actualFlightTravel.user).toEqual('Nicolas');
    expect(actualFlightTravel.routes[0].from).toEqual('MAD');
    expect(actualFlightTravel.routes[0].to).toEqual('BRU');
    expect(actualFlightTravel.routes[0].date).toEqual(new Date('2023-05-11'));









  })
});
