import * as path from 'path';
import * as fs from 'fs';
import { FileAirportRepository } from '../airport.file.repository';
import { airportBuilder } from '../../tests/airport.builder';

describe('FileAirportRepository', () => {
  const testFilePath = path.join(__dirname, 'airports-test.json');

  beforeEach(async () => {
    await fs.promises.writeFile(testFilePath, JSON.stringify([]));
  });

  test('getByIataCode() returns an airport by its IATA code', async () => {
    const airports = [
      {
        continent: 'EU',
        coordinates: '4.48443984985, 50.901401519800004',
        elevation_ft: '184',
        gps_code: 'EBBR',
        iata_code: 'BRU',
        ident: 'EBBR',
        iso_country: 'BE',
        iso_region: 'BE-BRU',
        local_code: null,
        municipality: 'Brussels',
        name: 'Brussels Airport',
        type: 'large_airport',
      },
      {
        continent: 'EU',
        coordinates: '-3.56264, 40.471926',
        elevation_ft: '1998',
        gps_code: 'LEMD',
        iata_code: 'MAD',
        ident: 'LEMD',
        iso_country: 'ES',
        iso_region: 'ES-M',
        local_code: null,
        municipality: 'Madrid',
        name: 'Adolfo Su\u00c3\u00a1rez Madrid\u00e2\u0080\u0093Barajas Airport',
        type: 'large_airport',
      },
    ];

    await fs.promises.writeFile(testFilePath, JSON.stringify(airports));

    const fileAirportRepository = new FileAirportRepository(testFilePath);

    const actualAirport = await fileAirportRepository.getByIataCode('MAD');

    expect(actualAirport).toMatchObject({
      iataCode: 'MAD',
      municipality: 'Madrid',
      coordinates: '-3.56264, 40.471926',
    });
  });
});
