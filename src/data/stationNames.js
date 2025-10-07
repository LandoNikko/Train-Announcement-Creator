export const stationNamePresets = {
  english: [
    'Central Station', 'North Station', 'South Station', 'East Station', 'West Station',
    'Downtown', 'Midtown', 'Uptown', 'Riverside', 'Hillside',
    'Park View', 'Garden Plaza', 'Market Square', 'City Center', 'Town Hall',
    'University', 'Hospital', 'Airport', 'Harbor', 'Bridge',
    'Highland', 'Lakeside', 'Woodland', 'Meadow', 'Summit',
    'Valley', 'Bay View', 'Oceanside', 'Sunset', 'Sunrise',
    'Liberty', 'Victory', 'Union', 'Grand', 'Royal'
  ],
  japanese: [
    '東京', '新宿', '渋谷', '池袋', '上野',
    '品川', '横浜', '大宮', '千葉', '川崎',
    '中野', '吉祥寺', '立川', '八王子', '町田',
    '新橋', '有楽町', '秋葉原', '神田', '浅草',
    '目黒', '恵比寿', '五反田', '大崎', '田町',
    '原宿', '代々木', '高田馬場', '新大久保', '鶯谷',
    '日暮里', '西日暮里', '駒込', '巣鴨', '大塚'
  ],
  generic: [
    'Station A', 'Station B', 'Station C', 'Station D', 'Station E',
    'Station F', 'Station G', 'Station H', 'Station I', 'Station J',
    'Station K', 'Station L', 'Station M', 'Station N', 'Station O',
    'Station P', 'Station Q', 'Station R', 'Station S', 'Station T',
    'Station U', 'Station V', 'Station W', 'Station X', 'Station Y', 'Station Z'
  ]
}

export const getNextStationName = (existingStations, language = 'en', lineNumber = null) => {
  const usedNames = new Set(existingStations.map(s => s.name))
  
  let presetList = stationNamePresets.generic
  if (language === 'ja') {
    presetList = stationNamePresets.japanese
  } else if (language === 'en') {
    presetList = stationNamePresets.english
  }
  
  for (const name of presetList) {
    if (!usedNames.has(name)) {
      return name
    }
  }
  
  return `Station ${existingStations.length + 1}`
}

export const getStationDisplayName = (station, stationIndex, linePrefix = null, showNumbers = false) => {
  if (!showNumbers) {
    return station.name
  }
  
  if (linePrefix) {
    return `${linePrefix}${stationIndex + 1}: ${station.name}`
  }
  
  return `${stationIndex + 1}. ${station.name}`
}

