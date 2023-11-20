import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from 'supertest';

import { TestingModule, Test } from "@nestjs/testing";
import { exec } from "child_process";
import { promisify } from "util";
import { AppModule } from "../../app.module";
import { FileAirportRepository } from "../../../infra/airport.file.repository";
import { AirportsApiController } from "../airports.api.controller";

const asyncExec = promisify(exec);

jest.setTimeout(10000);

describe('AirportsApiController (e2e)', () => {
  let app: INestApplication;
  let controller: AirportsApiController

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    controller = moduleFixture.get(AirportsApiController);
  })

  test('API controller should be defined', () => {
    expect(controller).toBeDefined();
  });

  test('GET /api/airports returns one or several airports when the query string matches an existing airport', async () => {
    expect.assertions(1);
    await request(app.getHttpServer())
      .get('/api/airports?q=CDG').expect(200).then(response => {
        expect(response.body).toEqual({
          data: {
            airports: [

              {
                iataCode: 'CDG',
                name: 'Charles de Gaulle International Airport',
                type: 'large_airport',
                coordinates: "2.55, 49.012798",
                country: 'FR',
                municipality: 'Paris'

              }
            ]
          }
        })
      })
  });

  test('GET /api/airports returns an empty list of airports when no matching airports has been found', async () => {
    expect.assertions(1);
    await request(app.getHttpServer())
      .get('/api/airports?q=XXXXXXXXX').expect(200).then(response => {
        expect(response.body).toEqual({
          data: {
            airports: []
          }
        })
      })
  });

  test('GET /api/airports returns an error when there are less than 3 characters in the search string', async () => {
    await request(app.getHttpServer())
      .get('/api/airports?q=XX').expect(400).then(response => {
        expect(response.body.message[0]).toEqual(expect.stringContaining('q must be longer than or equal to 3 characters'))
      })
  });

  test('GET /api/airports returns an error when there is no search string', async () => {
    await request(app.getHttpServer())
      .get('/api/airports').expect(400).then(response => {
        expect(response.body.message).toEqual(expect.arrayContaining(['q should not be empty']))
      })
  });
});
