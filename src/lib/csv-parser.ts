import Papa from 'papaparse';

export interface PopulationData {
  region: string;
  year: number;
  month: number;
  population: number;
}

export function parsePopulationCSV(csvString: string): PopulationData[] {
  const parsed = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data.map((row: any) => ({
    region: row.region,
    year: parseInt(row.year, 10),
    month: parseInt(row.month, 10),
    population: parseInt(row.population, 10),
  }));
}
