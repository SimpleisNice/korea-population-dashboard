declare module '@svg-maps/south-korea' {
  interface MapLocation {
    id: string
    name: string
    path: string
  }
  interface KoreaMapData {
    label: string
    viewBox: string
    locations: MapLocation[]
  }
  const southKorea: KoreaMapData
  export default southKorea
}
