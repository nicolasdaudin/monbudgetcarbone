import * as path from 'path';
import * as fs from 'fs';
import { FileAirportRepository } from '../airport.file.repository';
import { LARGE_AIRPORT_TYPE, MEDIUM_AIRPORT_TYPE } from '../../domain/airport';

/**
 * to run this test in TDD mode, you need to ignore watch on the airports-test.json file
 * (since we write onto it)
 * npm run test:watch -- airport.*integration --watchPathIgnorePatterns="airports-test.json"
 */
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

  test('getByIataCode() returns null when the airport does not exist', async () => {
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

    const actualAirport = await fileAirportRepository.getByIataCode('XXX');

    expect(actualAirport).toBeNull();
  });

  test('filterAirportsByType() returns only large airports when requested for large airports', async () => {
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
        type: 'medium_airport',
      },
    ];

    await fs.promises.writeFile(testFilePath, JSON.stringify(airports));

    const fileAirportRepository = new FileAirportRepository(testFilePath);

    const actualAirports = await fileAirportRepository.filterAirportsByType([LARGE_AIRPORT_TYPE]);

    expect(actualAirports).toHaveLength(1);
    expect(actualAirports).toEqual([expect.objectContaining({ type: LARGE_AIRPORT_TYPE })]);
  });

  test('filterAirportsByType() returns only medium airports when requested for medium airports', async () => {
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
        type: 'medium_airport',
      },
      {
        "continent": "NA",
        "coordinates": "-158.617996216, 59.2826004028",
        "elevation_ft": "66",
        "gps_code": "5A8",
        "iata_code": "WKK",
        "ident": "5A8",
        "iso_country": "US",
        "iso_region": "US-AK",
        "local_code": "5A8",
        "municipality": "Aleknagik",
        "name": "Aleknagik / New Airport",
        "type": "medium_airport"
      },
    ];

    await fs.promises.writeFile(testFilePath, JSON.stringify(airports));

    const fileAirportRepository = new FileAirportRepository(testFilePath);

    const actualAirports = await fileAirportRepository.filterAirportsByType([MEDIUM_AIRPORT_TYPE]);

    expect(actualAirports).toHaveLength(2);
    expect(actualAirports).toEqual([
      expect.objectContaining({ type: MEDIUM_AIRPORT_TYPE }),
      expect.objectContaining({ type: MEDIUM_AIRPORT_TYPE })
    ]);
  });
});
