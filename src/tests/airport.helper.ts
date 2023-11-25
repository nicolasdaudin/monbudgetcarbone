import { Airport } from "../domain/airport";


export const airportContainsQuerySearch = (
  airport: Airport,
  str: string
): boolean => {
  return (
    (airport.municipality && includesString(airport.municipality, str)) ||
    (airport.name && includesString(airport.name, str)) ||
    (airport.iataCode && includesString(airport.iataCode, str))
    //   ||
    // (airport.country && airport.country.toLowerCase().includes(strToLowerCase))
  );
};

export const airportStartsWithQuerySearch = (
  airport: Airport,
  str: string
): boolean => {
  return (
    (airport.municipality && startsWith(airport.municipality, str)) ||
    (airport.name && startsWith(airport.name, str)) ||
    (airport.iataCode && startsWith(airport.iataCode, str))
    //   ||
    // (airport.country &&
    //   airport.country.toLowerCase().startsWith(strToLowerCase))
  );
};

export const reencodeAirport = (airport: Airport): Airport => {
  if (!airport) return null;
  return {
    ...airport,
    municipality: airport.municipality
      ? reencodeString(airport.municipality)
      : null,
    name: airport.name ? reencodeString(airport.name) : null,
  };
};

const includesString = (property: string, str: string): boolean => {
  const strToLowerCase = str.toLowerCase();
  return normalizeString(property).toLowerCase().includes(strToLowerCase);
};

const startsWith = (property: string, str: string): boolean => {
  const strToLowerCase = str.toLowerCase();
  return normalizeString(property)
    .toLowerCase()
    .startsWith(strToLowerCase);
};



/**
 * Helper to reencode data from airport json data source
 * @param {*} str
 * @returns
 */
export const reencodeString = (str: string) => {
  const buffer = Buffer.from(str, 'latin1');
  return buffer.toString('utf8');
};

/**
 * Helper to normalize data from airport data json source
 * @param {*} str
 * @returns
 */
export const normalizeString = (str: string) => {
  const result = reencodeString(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return result;
};

/**
 * Remove fields from an object
 * @param {*} obj
 * @param  {...any} allowedFields
 */
const filterObj = (obj: any, allowedFields: string[]) => {
  const newObj: any = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
