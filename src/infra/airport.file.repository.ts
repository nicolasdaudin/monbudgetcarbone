import {
  AirportRepository,
} from '../application/airport.repository';
import {
  AUTHORIZED_AIRPORT_TYPES,
  Airport, AirportType
} from '../domain/airport';
import * as fs from 'fs';
import * as path from 'path';

type JSONAirport = {
  continent: string;
  coordinates: string;
  elevation_ft: string;
  gps_code: string;
  iata_code: string;
  ident: string;
  iso_country: string;
  iso_region: string;
  local_code: string;
  municipality: string;
  name: string;
  type: string;
};

export class FileAirportRepository implements AirportRepository {
  private airports: Airport[] = [];

  constructor(
    private readonly filePath = path.join(
      __dirname,
      'datasets/airport-codes.json',
    ),
  ) {
    const parsedAirports = JSON.parse(
      fs.readFileSync(this.filePath, 'utf-8'),
    ) as JSONAirport[];
    const filteredAirports = parsedAirports
      .filter((airport) => AUTHORIZED_AIRPORT_TYPES.includes(airport.type as AirportType))
      .filter((airport) => airport.iata_code);
    this.airports = filteredAirports.map((airport) => {
      return {
        coordinates: airport.coordinates,
        iataCode: airport.iata_code,
        country: airport.iso_country,
        municipality: airport.municipality,
        name: airport.name,
        type: airport.type as AirportType,
      };
    });
  }

  getByIataCode(iataCode: string): Airport {
    const airport = this.airports.find(
      (airport) => airport.iataCode.toLowerCase() === iataCode.toLowerCase(),
    );

    return airport;
  }

  filterAirportsByType(filters: AirportType[]): Airport[] {
    const airports = this.airports.filter((airport) =>
      filters.includes(airport.type),
    );

    return airports;
  }
}

// 
