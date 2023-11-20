import { normalizeString, reencodeString } from "./airport.helper";

describe('Airport Helper module', function () {
  describe('recoding utility', function () {
    test('should reencode correctly special characters', function () {
      const reencoded = reencodeString('MÃ¡laga');
      expect(reencoded).toBe('Málaga');
    });
    test('should normalize correctly special characters', function () {
      const reencoded = normalizeString('M\u00c3\u00a1laga');
      expect(reencoded).toBe('Malaga');
    });
  });

  describe('filterObj', () => {
    test.todo('should return a new object with only the allowed fields');
  });
});