import { Injectable } from "@nestjs/common";
import { AirportRepository } from "../airport.repository";
import { AUTHORIZED_AIRPORT_TYPES, Airport, LARGE_AIRPORT_TYPE, MEDIUM_AIRPORT_TYPE } from "../../domain/airport";
import { airportContainsQuerySearch, airportStartsWithQuerySearch } from "../../tests/airport.helper";

const LIMIT_AIRPORTS_RETURNED = 10;

export type GetAirportsCommand = {
  searchStr: string
}

@Injectable()
export class GetAirportsUseCase {
  constructor(private readonly airportRepository: AirportRepository) { }

  async handle(getAirportsCommand: GetAirportsCommand): Promise<Airport[]> {

    const searchStr = getAirportsCommand.searchStr;

    // first check if 'str' is not empty or null
    if (!searchStr || searchStr.length < 3) {
      return []
    }

    const str = searchStr.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // then get the BIG airports starting with the query string
    const largeStartsWith = this.airportRepository.filterAirportsByType([LARGE_AIRPORT_TYPE]).filter((airport) =>
      airportStartsWithQuerySearch(airport, str)
    );

    // then get the MEDIUM airports starting with the query string
    const mediumStartsWith = this.airportRepository.filterAirportsByType([MEDIUM_AIRPORT_TYPE]).filter((airport) =>
      airportStartsWithQuerySearch(airport, str)
    );
    // then get the BIG airports that have the query string in their info
    const largeContains = this.airportRepository.filterAirportsByType([LARGE_AIRPORT_TYPE]).filter((airport) =>
      airportContainsQuerySearch(airport, str)
    );
    // and finally the MEDIUM airports that have the query string in their info
    const mediumContains = this.airportRepository.filterAirportsByType([MEDIUM_AIRPORT_TYPE]).filter((airport) =>
      airportContainsQuerySearch(airport, str)
    );

    // the filters above will return some results more than once
    // let's make a Set of unique IATA_CODES
    const uniqueIataCodes = Array.from(
      new Set(
        largeStartsWith
          .concat(mediumStartsWith)
          .concat(largeContains)
          .concat(mediumContains)
          .map((airport) => airport.iataCode)
      )
    );

    // for performance reasons, we convert to a Map to be able to map a iata_code to the corresponding airport. Which is much faster than doing a map and a find ...
    const airportsMap = new Map(
      this.airportRepository.filterAirportsByType([...AUTHORIZED_AIRPORT_TYPES]).map((airport) => [airport.iataCode, airport])
    );

    const uniqueAirports = uniqueIataCodes.map((iataCode) =>
      airportsMap.get(iataCode)
    );

    return uniqueAirports
      .slice(0, LIMIT_AIRPORTS_RETURNED)
    // .map(filterAirportFields)
    // .map(reencodeAirport)

  };
}
