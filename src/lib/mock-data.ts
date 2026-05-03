import type { Region, RegionDetail, TrendPoint, AgeGroup, MigrationPoint, MonthlyStats } from './types'

export const REGIONS: Region[] = [
  // 서울특별시
  { code: '1111000000', sido: '서울특별시', sigungu: '종로구' },
  { code: '1114000000', sido: '서울특별시', sigungu: '중구' },
  { code: '1117000000', sido: '서울특별시', sigungu: '용산구' },
  { code: '1120000000', sido: '서울특별시', sigungu: '성동구' },
  { code: '1121500000', sido: '서울특별시', sigungu: '광진구' },
  { code: '1123000000', sido: '서울특별시', sigungu: '동대문구' },
  { code: '1126000000', sido: '서울특별시', sigungu: '중랑구' },
  { code: '1129000000', sido: '서울특별시', sigungu: '성북구' },
  { code: '1130500000', sido: '서울특별시', sigungu: '강북구' },
  { code: '1132000000', sido: '서울특별시', sigungu: '도봉구' },
  { code: '1135000000', sido: '서울특별시', sigungu: '노원구' },
  { code: '1138000000', sido: '서울특별시', sigungu: '은평구' },
  { code: '1141000000', sido: '서울특별시', sigungu: '서대문구' },
  { code: '1144000000', sido: '서울특별시', sigungu: '마포구' },
  { code: '1147000000', sido: '서울특별시', sigungu: '양천구' },
  { code: '1150000000', sido: '서울특별시', sigungu: '강서구' },
  { code: '1153000000', sido: '서울특별시', sigungu: '구로구' },
  { code: '1154500000', sido: '서울특별시', sigungu: '금천구' },
  { code: '1156000000', sido: '서울특별시', sigungu: '영등포구' },
  { code: '1159000000', sido: '서울특별시', sigungu: '동작구' },
  { code: '1162000000', sido: '서울특별시', sigungu: '관악구' },
  { code: '1165000000', sido: '서울특별시', sigungu: '서초구' },
  { code: '1168000000', sido: '서울특별시', sigungu: '강남구' },
  { code: '1171000000', sido: '서울특별시', sigungu: '송파구' },
  { code: '1174000000', sido: '서울특별시', sigungu: '강동구' },
  // 경기도
  { code: '4111100000', sido: '경기도', sigungu: '수원시 장안구' },
  { code: '4111300000', sido: '경기도', sigungu: '수원시 권선구' },
  { code: '4111500000', sido: '경기도', sigungu: '수원시 팔달구' },
  { code: '4111700000', sido: '경기도', sigungu: '수원시 영통구' },
  { code: '4113100000', sido: '경기도', sigungu: '성남시 수정구' },
  { code: '4113300000', sido: '경기도', sigungu: '성남시 중원구' },
  { code: '4113500000', sido: '경기도', sigungu: '성남시 분당구' },
  { code: '4115000000', sido: '경기도', sigungu: '의정부시' },
  { code: '4117000000', sido: '경기도', sigungu: '안양시 만안구' },
  { code: '4117500000', sido: '경기도', sigungu: '안양시 동안구' },
  { code: '4119000000', sido: '경기도', sigungu: '부천시' },
  { code: '4121000000', sido: '경기도', sigungu: '광명시' },
  { code: '4122000000', sido: '경기도', sigungu: '평택시' },
  { code: '4125000000', sido: '경기도', sigungu: '동두천시' },
  { code: '4127000000', sido: '경기도', sigungu: '안산시 상록구' },
  { code: '4127500000', sido: '경기도', sigungu: '안산시 단원구' },
  { code: '4129000000', sido: '경기도', sigungu: '고양시 덕양구' },
  { code: '4129300000', sido: '경기도', sigungu: '고양시 일산동구' },
  { code: '4129500000', sido: '경기도', sigungu: '고양시 일산서구' },
  { code: '4131000000', sido: '경기도', sigungu: '과천시' },
  { code: '4132000000', sido: '경기도', sigungu: '구리시' },
  { code: '4136000000', sido: '경기도', sigungu: '남양주시' },
  { code: '4137000000', sido: '경기도', sigungu: '오산시' },
  { code: '4139000000', sido: '경기도', sigungu: '시흥시' },
  { code: '4141000000', sido: '경기도', sigungu: '군포시' },
  { code: '4143000000', sido: '경기도', sigungu: '의왕시' },
  { code: '4145000000', sido: '경기도', sigungu: '하남시' },
  { code: '4146000000', sido: '경기도', sigungu: '용인시 처인구' },
  { code: '4146300000', sido: '경기도', sigungu: '용인시 기흥구' },
  { code: '4146500000', sido: '경기도', sigungu: '용인시 수지구' },
  { code: '4148000000', sido: '경기도', sigungu: '파주시' },
  { code: '4150000000', sido: '경기도', sigungu: '이천시' },
  { code: '4155000000', sido: '경기도', sigungu: '안성시' },
  { code: '4157000000', sido: '경기도', sigungu: '김포시' },
  { code: '4159000000', sido: '경기도', sigungu: '화성시' },
  { code: '4161000000', sido: '경기도', sigungu: '광주시' },
  { code: '4163000000', sido: '경기도', sigungu: '양주시' },
  { code: '4165000000', sido: '경기도', sigungu: '포천시' },
  // 부산광역시
  { code: '2611000000', sido: '부산광역시', sigungu: '중구' },
  { code: '2614000000', sido: '부산광역시', sigungu: '서구' },
  { code: '2617000000', sido: '부산광역시', sigungu: '동구' },
  { code: '2620000000', sido: '부산광역시', sigungu: '영도구' },
  { code: '2623000000', sido: '부산광역시', sigungu: '부산진구' },
  { code: '2626000000', sido: '부산광역시', sigungu: '동래구' },
  { code: '2629000000', sido: '부산광역시', sigungu: '남구' },
  { code: '2632000000', sido: '부산광역시', sigungu: '북구' },
  { code: '2635000000', sido: '부산광역시', sigungu: '해운대구' },
  { code: '2638000000', sido: '부산광역시', sigungu: '사하구' },
  { code: '2641000000', sido: '부산광역시', sigungu: '금정구' },
  { code: '2644000000', sido: '부산광역시', sigungu: '강서구' },
  { code: '2647000000', sido: '부산광역시', sigungu: '연제구' },
  { code: '2650000000', sido: '부산광역시', sigungu: '수영구' },
  { code: '2653000000', sido: '부산광역시', sigungu: '사상구' },
  // 인천광역시
  { code: '2811000000', sido: '인천광역시', sigungu: '중구' },
  { code: '2814000000', sido: '인천광역시', sigungu: '동구' },
  { code: '2817700000', sido: '인천광역시', sigungu: '미추홀구' },
  { code: '2818500000', sido: '인천광역시', sigungu: '연수구' },
  { code: '2820000000', sido: '인천광역시', sigungu: '남동구' },
  { code: '2823000000', sido: '인천광역시', sigungu: '부평구' },
  { code: '2826000000', sido: '인천광역시', sigungu: '계양구' },
  { code: '2829000000', sido: '인천광역시', sigungu: '서구' },
]

export const POPULAR_REGIONS: string[] = [
  '1168000000', // 강남구
  '1171000000', // 송파구
  '4113500000', // 분당구
  '1144000000', // 마포구
  '2635000000', // 해운대구
  '4159000000', // 화성시
]

function makeTrend(basePopulation: number, baseHouseholds: number, months = 12): TrendPoint[] {
  const result: TrendPoint[] = []
  let pop = basePopulation
  let hh = baseHouseholds
  const now = new Date(2025, 3)
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i)
    const delta = Math.floor((Math.random() - 0.52) * 800)
    const prevPop = pop
    pop += delta
    hh += Math.floor(delta * 0.45)
    result.push({
      label: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`,
      population: pop,
      households: hh,
      change: pop - prevPop,
    })
  }
  return result
}

function makeAgeGroups(): AgeGroup[] {
  const labels = ['0–9', '10–19', '20–29', '30–39', '40–49', '50–59', '60–69', '70–79', '80+']
  return labels.map(label => ({
    label,
    male: Math.floor(Math.random() * 15000 + 8000),
    female: Math.floor(Math.random() * 15000 + 8000),
  }))
}

function makeMigration(months = 12): MigrationPoint[] {
  const result: MigrationPoint[] = []
  const now = new Date(2025, 3)
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i)
    const inflow = Math.floor(Math.random() * 3000 + 1000)
    const outflow = Math.floor(Math.random() * 3000 + 1000)
    result.push({
      label: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`,
      inflow,
      outflow,
      net: inflow - outflow,
    })
  }
  return result
}

const REGION_SEEDS: Record<string, { population: number; households: number; male: number; female: number }> = {
  '1168000000': { population: 542_000, households: 241_000, male: 261_000, female: 281_000 },
  '1171000000': { population: 678_000, households: 289_000, male: 325_000, female: 353_000 },
  '4113500000': { population: 461_000, households: 188_000, male: 224_000, female: 237_000 },
  '1144000000': { population: 384_000, households: 197_000, male: 189_000, female: 195_000 },
  '2635000000': { population: 414_000, households: 180_000, male: 202_000, female: 212_000 },
  '4159000000': { population: 938_000, households: 368_000, male: 472_000, female: 466_000 },
}

function getSeed(code: string) {
  if (REGION_SEEDS[code]) return REGION_SEEDS[code]
  const base = parseInt(code.slice(0, 4)) % 500
  const pop = (base + 1) * 1000 + Math.floor(Math.random() * 100_000 + 80_000)
  const hh = Math.floor(pop * 0.43)
  const male = Math.floor(pop * 0.49)
  return { population: pop, households: hh, male, female: pop - male }
}

const cache = new Map<string, RegionDetail>()

export function getMockRegionDetail(code: string): RegionDetail | null {
  const region = REGIONS.find(r => r.code === code)
  if (!region) return null

  if (cache.has(code)) return cache.get(code)!

  const seed = getSeed(code)
  const trend = makeTrend(seed.population, seed.households)
  const latest = trend[trend.length - 1]
  const prevMonth = trend[trend.length - 2]

  const latestStats: MonthlyStats = {
    year: 2025,
    month: 4,
    population: latest.population,
    households: latest.households,
    householdSize: parseFloat((latest.population / latest.households).toFixed(2)),
    male: seed.male,
    female: seed.female,
  }

  const prevStats: MonthlyStats = {
    year: 2025,
    month: 3,
    population: prevMonth.population,
    households: prevMonth.households,
    householdSize: parseFloat((prevMonth.population / prevMonth.households).toFixed(2)),
    male: Math.floor(prevMonth.population * 0.49),
    female: Math.floor(prevMonth.population * 0.51),
  }

  const detail: RegionDetail = {
    region,
    latest: latestStats,
    prevMonth: prevStats,
    trend,
    ageGroups: makeAgeGroups(),
    migration: makeMigration(),
  }

  cache.set(code, detail)
  return detail
}

export function getRegionBySlug(sido: string, sigungu: string): Region | null {
  return REGIONS.find(r => r.sido === sido && r.sigungu === sigungu) ?? null
}
