import fs from 'fs';
import path from 'path';
import {
  parseMOISPopulationCSV,
  MonthlyPopulationRecord,
  getTopLevelRegions,
  RegionSummary,
} from './csv-parser';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

const CSV_FILES = [
  'resident_population_household_status_202401_202412.csv',
  'resident_population_household_status_202501_202512.csv',
];

let cachedRecords: MonthlyPopulationRecord[] | null = null;

/**
 * Load and parse all MOIS CSV files. Results are cached in memory per server instance.
 */
export function loadAllRecords(): MonthlyPopulationRecord[] {
  if (cachedRecords) return cachedRecords;

  const allRecords: MonthlyPopulationRecord[] = [];
  for (const file of CSV_FILES) {
    const filePath = path.join(DATA_DIR, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      allRecords.push(...parseMOISPopulationCSV(content));
    }
  }

  cachedRecords = allRecords;
  return allRecords;
}

/**
 * Get all available years from the dataset.
 */
export function getAvailableYears(): number[] {
  const records = loadAllRecords();
  const years = new Set(records.map(r => r.year));
  return Array.from(years).sort((a, b) => b - a); // Descending
}

/**
 * Get all available months for a given year.
 */
export function getAvailableMonths(year: number): number[] {
  const records = loadAllRecords();
  const months = new Set(
    records.filter(r => r.year === year).map(r => r.month)
  );
  return Array.from(months).sort((a, b) => a - b);
}

/**
 * Get the list of top-level (시도) region names.
 */
export function getRegionList(): string[] {
  const records = loadAllRecords();
  return getTopLevelRegions(records);
}

/**
 * Get monthly population trend for a specific region.
 * Returns data sorted by year, month.
 */
export function getRegionTrend(
  regionName: string,
  yearFrom?: number,
  yearTo?: number
): MonthlyPopulationRecord[] {
  const records = loadAllRecords();
  return records
    .filter(r => {
      if (r.regionName !== regionName) return false;
      if (yearFrom && r.year < yearFrom) return false;
      if (yearTo && r.year > yearTo) return false;
      return true;
    })
    .sort((a, b) => a.year - b.year || a.month - b.month);
}

/**
 * Get summary for a region at a specific point in time (year/month).
 * Compares with the same month of the previous year for YoY change.
 */
export function getRegionSummary(
  regionName: string,
  year: number,
  month: number
): RegionSummary | null {
  const records = loadAllRecords();

  const current = records.find(
    r => r.regionName === regionName && r.year === year && r.month === month
  );
  const previous = records.find(
    r => r.regionName === regionName && r.year === year - 1 && r.month === month
  );

  if (!current) return null;

  const prevPop = previous?.totalPopulation || current.totalPopulation;
  const change = current.totalPopulation - prevPop;
  const changePercent = prevPop > 0 ? (change / prevPop) * 100 : 0;

  return {
    regionCode: current.regionCode,
    regionName: current.regionName,
    latestPopulation: current.totalPopulation,
    previousPopulation: prevPop,
    yoyChange: change,
    yoyChangePercent: changePercent,
    households: current.households,
    malePopulation: current.malePopulation,
    femalePopulation: current.femalePopulation,
    genderRatio: current.genderRatio,
  };
}

/**
 * Get top-level region summaries for a given month, sorted by population descending.
 * This provides the data for the regional shift chart.
 */
export function getAllRegionSummaries(
  year: number,
  month: number
): RegionSummary[] {
  const regions = getRegionList();
  const summaries: RegionSummary[] = [];

  for (const regionName of regions) {
    const summary = getRegionSummary(regionName, year, month);
    if (summary) {
      summaries.push(summary);
    }
  }

  return summaries.sort((a, b) => b.latestPopulation - a.latestPopulation);
}

/**
 * Get the latest available month for a given year.
 */
export function getLatestMonth(year: number): number {
  const months = getAvailableMonths(year);
  return months.length > 0 ? months[months.length - 1] : 1;
}

/**
 * Get national total summary for a specific month.
 * Uses the first record (전국 or 시도급).
 * Actually there's no 전국 row, so we sum all top-level regions.
 */
export function getNationalSummary(year: number, month: number) {
  const summaries = getAllRegionSummaries(year, month);
  const totalPop = summaries.reduce((sum, s) => sum + s.latestPopulation, 0);
  const prevPop = summaries.reduce((sum, s) => sum + s.previousPopulation, 0);
  const totalHouseholds = summaries.reduce((sum, s) => sum + s.households, 0);
  const totalMale = summaries.reduce((sum, s) => sum + s.malePopulation, 0);
  const totalFemale = summaries.reduce((sum, s) => sum + s.femalePopulation, 0);
  const change = totalPop - prevPop;
  const changePercent = prevPop > 0 ? (change / prevPop) * 100 : 0;

  return {
    totalPopulation: totalPop,
    previousPopulation: prevPop,
    yoyChange: change,
    yoyChangePercent: changePercent,
    households: totalHouseholds,
    malePopulation: totalMale,
    femalePopulation: totalFemale,
    genderRatio: totalFemale > 0 ? totalMale / totalFemale : 0,
  };
}
