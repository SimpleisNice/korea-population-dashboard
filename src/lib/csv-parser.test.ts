import { describe, it, expect } from 'vitest';
import { parseMOISPopulationCSV, getTopLevelRegions } from './csv-parser';

const SAMPLE_CSV = `※ 매월 말일자 통계 현황,Unnamed: 1,Unnamed: 2,Unnamed: 3,Unnamed: 4,Unnamed: 5,Unnamed: 6,Unnamed: 7
,,2024년01월,,,,,,2024년02월,,,,,
행정기관코드,행정기관,총 거주자수,세대수,세대당 인구,남자 인구수,여자 인구수,남여 비율,총 거주자수,세대수,세대당 인구,남자 인구수,여자 인구수,남여 비율
1100000000,서울특별시  ,"9,313,144","4,420,014",2.11,"4,501,581","4,811,563",0.94,"9,315,577","4,429,734",2.10,"4,501,596","4,813,981",0.94
1111000000,서울특별시 종로구 ,"137,560","70,773",1.94,"66,277","71,283",0.93,"137,674","70,981",1.94,"66,321","71,353",0.93`;

describe('parseMOISPopulationCSV', () => {
  it('should parse MOIS CSV with multi-header structure', () => {
    const records = parseMOISPopulationCSV(SAMPLE_CSV);
    expect(records.length).toBe(4); // 2 regions x 2 months
  });

  it('should correctly parse Korean formatted numbers', () => {
    const records = parseMOISPopulationCSV(SAMPLE_CSV);
    const seoulJan = records.find(r => r.regionName.includes('서울특별시') && r.month === 1 && !r.regionName.includes('종로'));
    expect(seoulJan).toBeDefined();
    expect(seoulJan!.totalPopulation).toBe(9313144);
    expect(seoulJan!.households).toBe(4420014);
    expect(seoulJan!.malePopulation).toBe(4501581);
    expect(seoulJan!.femalePopulation).toBe(4811563);
  });

  it('should extract year and month correctly', () => {
    const records = parseMOISPopulationCSV(SAMPLE_CSV);
    const months = new Set(records.map(r => r.month));
    expect(months.has(1)).toBe(true);
    expect(months.has(2)).toBe(true);
    expect(records[0].year).toBe(2024);
  });

  it('should handle region codes correctly', () => {
    const records = parseMOISPopulationCSV(SAMPLE_CSV);
    const seoul = records.find(r => r.regionCode === '1100000000');
    expect(seoul).toBeDefined();
    expect(seoul!.regionName).toContain('서울특별시');
  });

  it('should return empty array for empty input', () => {
    expect(parseMOISPopulationCSV('')).toEqual([]);
    expect(parseMOISPopulationCSV('line1\nline2')).toEqual([]);
  });
});

describe('getTopLevelRegions', () => {
  it('should identify top-level regions by code ending with 00000000', () => {
    const records = parseMOISPopulationCSV(SAMPLE_CSV);
    const topLevel = getTopLevelRegions(records);
    expect(topLevel.length).toBe(1); // Only 서울특별시
    expect(topLevel[0]).toContain('서울특별시');
  });
});
