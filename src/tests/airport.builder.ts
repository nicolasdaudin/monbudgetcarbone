import { Airport, AirportType } from "../application/airport.repository";



export const airportBuilder = (
  {
    iataCode = 'AAA',
    coordinates = '0, 0',
    isoCountry = 'AA',
    municipality = 'AAA_municipality',
    name = 'AAA_name',
    type = 'large_airport'
  }: {
    iataCode?: string,
    coordinates?: string,
    isoCountry?: string,
    municipality?: string,
    name?: string,
    type?: AirportType
  } = {}) => {
  const props = { iataCode, coordinates, isoCountry, municipality, name, type }
  return {
    withIataCode(iataCode: string) {
      return airportBuilder({
        ...props,
        iataCode
      })
    },
    locatedAt(coordinates: string) {
      return airportBuilder({
        ...props,
        coordinates
      })
    },
    withCountry(isoCountry: string) {
      return airportBuilder({
        ...props,
        isoCountry
      })
    },
    withMunicipality(municipality: string) {
      return airportBuilder({
        ...props,
        municipality
      })
    },
    withName(name: string) {
      return airportBuilder({
        ...props,
        name
      })
    },
    withType(type: AirportType) {
      return airportBuilder({
        ...props,
        isoCountry
      })
    },


    build(): Airport {
      return {
        iataCode: props.iataCode,
        coordinates: props.coordinates,
        isoCountry: props.isoCountry,
        municipality: props.municipality,
        name: props.name,
        type: props.type,
      };
    }
  }
}