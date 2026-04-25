import fs from 'fs';
import path from 'path';
import { parsePopulationCSV, PopulationData } from './csv-parser';

export async function getPopulationData(): Promise<PopulationData[]> {
  const filePath = path.join(process.cwd(), 'public', 'data', 'population.csv');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return parsePopulationCSV(fileContents);
}
