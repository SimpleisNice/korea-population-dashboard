import { describe, it, expect } from 'vitest';
import { parsePopulationCSV } from './csv-parser';

describe('CSV Parser Utility', () => {
  it('should parse valid CSV string into PopulationData array', () => {
    const csvData = `region,year,month,population\n서울,2023,1,9400000\n부산,2023,1,3300000`;

    const result = parsePopulationCSV(csvData);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      region: '서울',
      year: 2023,
      month: 1,
      population: 9400000,
    });
  });

  it('should handle empty rows correctly by skipping them', () => {
    const csvData = `region,year,month,population\n서울,2023,1,9400000\n\n부산,2023,1,3300000`;

    const result = parsePopulationCSV(csvData);
    expect(result).toHaveLength(2);
  });
});
