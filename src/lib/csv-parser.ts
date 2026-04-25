/**
 * CSV Parser for MOIS (행정안전부) Resident Population Data
 *
 * The CSV has a complex multi-header structure:
 *   Row 1: "※ 매월 말일자 통계 현황" (metadata, skip)
 *   Row 2: Month headers like "2024년01월", repeating every 6 columns
 *   Row 3: Column headers: 행정기관코드, 행정기관, 총 거주자수, 세대수, 세대당 인구, 남자 인구수, 여자 인구수, 남여 비율
 *   Row 4+: Data rows
 *
 * Each month occupies 6 columns: 총 거주자수, 세대수, 세대당 인구, 남자 인구수, 여자 인구수, 남여 비율
 * There are 12 months per file, so 2 (code+name) + 12*6 = 74 columns total
 */

export interface MonthlyPopulationRecord {
  /** 행정기관코드 e.g. "1100000000" */
  regionCode: string;
  /** 행정기관 e.g. "서울특별시" */
  regionName: string;
  /** Year e.g. 2024 */
  year: number;
  /** Month 1-12 */
  month: number;
  /** 총 거주자수 */
  totalPopulation: number;
  /** 세대수 */
  households: number;
  /** 세대당 인구 */
  populationPerHousehold: number;
  /** 남자 인구수 */
  malePopulation: number;
  /** 여자 인구수 */
  femalePopulation: number;
  /** 남여 비율 */
  genderRatio: number;
}

/**
 * Parse a number string that may contain commas and quotes, e.g. "9,313,144"
 */
function parseKoreanNumber(value: string): number {
  if (!value || value.trim() === '') return 0;
  const cleaned = value.replace(/"/g, '').replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Extract year and month from a header cell like "2024년01월"
 */
function parseYearMonth(header: string): { year: number; month: number } | null {
  const match = header.match(/(\d{4})년(\d{2})월/);
  if (!match) return null;
  return { year: parseInt(match[1], 10), month: parseInt(match[2], 10) };
}

/**
 * Parse the MOIS CSV text into structured monthly records.
 *
 * @param csvText Raw CSV file content
 * @returns Array of MonthlyPopulationRecord
 */
export function parseMOISPopulationCSV(csvText: string): MonthlyPopulationRecord[] {
  const lines = csvText.split('\n').map(line => line.trim()).filter(Boolean);

  if (lines.length < 4) return [];

  // Row 2 (index 1): Month headers
  // We need to split carefully because values may be quoted with commas inside
  const monthHeaderRow = splitCSVLine(lines[1]);

  // Build month map: for each group of 6 columns, extract year/month
  // First 2 columns are 행정기관코드 and 행정기관 (empty in month header row)
  const months: { year: number; month: number; startCol: number }[] = [];
  for (let i = 2; i < monthHeaderRow.length; i++) {
    const cell = monthHeaderRow[i].trim();
    const parsed = parseYearMonth(cell);
    if (parsed) {
      months.push({ ...parsed, startCol: i });
    }
  }

  // Row 3 (index 2): Column headers (skip, we know the structure)
  // Row 4+ (index 3+): Data
  const records: MonthlyPopulationRecord[] = [];

  for (let rowIdx = 3; rowIdx < lines.length; rowIdx++) {
    const cols = splitCSVLine(lines[rowIdx]);
    if (cols.length < 8) continue; // Skip malformed rows

    const regionCode = cols[0]?.trim() || '';
    const regionName = cols[1]?.trim() || '';

    // Skip empty region codes or sub-office entries with 0 population
    if (!regionCode || !regionName) continue;

    for (const monthInfo of months) {
      const base = monthInfo.startCol;
      const totalPop = parseKoreanNumber(cols[base] || '');

      // Skip months with 0 population (출장소 etc.)
      if (totalPop === 0) continue;

      records.push({
        regionCode,
        regionName: regionName.trim(),
        year: monthInfo.year,
        month: monthInfo.month,
        totalPopulation: totalPop,
        households: parseKoreanNumber(cols[base + 1] || ''),
        populationPerHousehold: parseKoreanNumber(cols[base + 2] || ''),
        malePopulation: parseKoreanNumber(cols[base + 3] || ''),
        femalePopulation: parseKoreanNumber(cols[base + 4] || ''),
        genderRatio: parseKoreanNumber(cols[base + 5] || ''),
      });
    }
  }

  return records;
}

/**
 * Split a CSV line respecting quoted fields.
 * Handles values like "9,313,144" correctly.
 */
function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// ───── Helper types for aggregated data ─────

export interface RegionSummary {
  regionCode: string;
  regionName: string;
  latestPopulation: number;
  previousPopulation: number;
  yoyChange: number;
  yoyChangePercent: number;
  households: number;
  malePopulation: number;
  femalePopulation: number;
  genderRatio: number;
}

/**
 * Get top-level regions (광역시/도) from parsed records.
 * These have 10-digit codes ending in "00000000".
 */
export function getTopLevelRegions(records: MonthlyPopulationRecord[]): string[] {
  const seen = new Set<string>();
  return records
    .filter(r => {
      if (seen.has(r.regionName)) return false;
      // Top-level: code ends with 8 zeros (e.g., 1100000000 for 서울)
      if (r.regionCode.endsWith('00000000')) {
        seen.add(r.regionName);
        return true;
      }
      return false;
    })
    .map(r => r.regionName);
}

/**
 * Get sub-regions (시군구) for a given top-level region code prefix.
 */
export function getSubRegions(records: MonthlyPopulationRecord[], parentCode: string): string[] {
  const prefix = parentCode.substring(0, 2);
  const seen = new Set<string>();
  return records
    .filter(r => {
      if (seen.has(r.regionName)) return false;
      // Sub-region: starts with same 2-digit prefix but is NOT the parent itself
      if (r.regionCode.startsWith(prefix) && !r.regionCode.endsWith('00000000') && r.totalPopulation > 0) {
        seen.add(r.regionName);
        return true;
      }
      return false;
    })
    .map(r => r.regionName);
}

// Keep backward-compatible export for tests
export interface PopulationData {
  region: string;
  year: number;
  month: number;
  population: number;
}
