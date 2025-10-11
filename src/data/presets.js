export const trainPresets = [
  {
    id: 'yamanote',
    name: 'Yamanote Line',
    description: 'Tokyo\'s iconic circular line',
    stations: [
      { id: 'tokyo', x: 390, y: 240, name: 'Tokyo', color: '#10b981' },
      { id: 'yurakucho', x: 360, y: 210, name: 'Yurakucho', color: '#10b981' },
      { id: 'shimbashi', x: 330, y: 180, name: 'Shimbashi', color: '#10b981' },
      { id: 'hamamatsucho', x: 300, y: 180, name: 'Hamamatsucho', color: '#10b981' },
      { id: 'tamachi', x: 270, y: 210, name: 'Tamachi', color: '#10b981' },
      { id: 'shinagawa', x: 270, y: 270, name: 'Shinagawa', color: '#10b981' },
      { id: 'osaki', x: 270, y: 330, name: 'Osaki', color: '#10b981' },
      { id: 'gotanda', x: 300, y: 360, name: 'Gotanda', color: '#10b981' },
      { id: 'meguro', x: 330, y: 390, name: 'Meguro', color: '#10b981' },
      { id: 'ebisu', x: 360, y: 390, name: 'Ebisu', color: '#10b981' },
      { id: 'shibuya', x: 420, y: 390, name: 'Shibuya', color: '#10b981' },
      { id: 'harajuku', x: 450, y: 360, name: 'Harajuku', color: '#10b981' },
      { id: 'yoyogi', x: 480, y: 330, name: 'Yoyogi', color: '#10b981' },
      { id: 'shinjuku', x: 510, y: 300, name: 'Shinjuku', color: '#10b981' },
      { id: 'shin-okubo', x: 540, y: 270, name: 'Shin-Okubo', color: '#10b981' },
      { id: 'takadanobaba', x: 570, y: 240, name: 'Takadanobaba', color: '#10b981' },
      { id: 'ikebukuro', x: 570, y: 180, name: 'Ikebukuro', color: '#10b981' },
      { id: 'uguisudani', x: 510, y: 120, name: 'Uguisudani', color: '#10b981' },
      { id: 'ueno', x: 450, y: 120, name: 'Ueno', color: '#10b981' },
      { id: 'akihabara', x: 420, y: 180, name: 'Akihabara', color: '#10b981' },
      { id: 'kanda', x: 420, y: 210, name: 'Kanda', color: '#10b981' },
    ],
    lines: [
      {
        id: 'yamanote-line',
        name: 'Yamanote Line',
        color: '#10b981',
        tension: 0.5,
        stations: [
          'tokyo', 'yurakucho', 'shimbashi', 'hamamatsucho', 'tamachi', 'shinagawa',
          'osaki', 'gotanda', 'meguro', 'ebisu', 'shibuya', 'harajuku', 'yoyogi',
          'shinjuku', 'shin-okubo', 'takadanobaba', 'ikebukuro', 'uguisudani',
          'ueno', 'akihabara', 'kanda', 'tokyo'
        ]
      }
    ]
  },
  {
    id: 'chuo',
    name: 'Chuo Line',
    description: 'Rapid service through central Tokyo',
    stations: [
      { id: 'tokyo-c', x: 150, y: 300, name: 'Tokyo', color: '#f97316' },
      { id: 'kanda-c', x: 210, y: 300, name: 'Kanda', color: '#f97316' },
      { id: 'ochanomizu', x: 270, y: 300, name: 'Ochanomizu', color: '#f97316' },
      { id: 'yotsuya', x: 330, y: 300, name: 'Yotsuya', color: '#f97316' },
      { id: 'shinjuku-c', x: 390, y: 300, name: 'Shinjuku', color: '#f97316' },
      { id: 'nakano', x: 450, y: 300, name: 'Nakano', color: '#f97316' },
      { id: 'koenji', x: 510, y: 300, name: 'Koenji', color: '#f97316' },
      { id: 'asagaya', x: 570, y: 300, name: 'Asagaya', color: '#f97316' },
      { id: 'ogikubo', x: 630, y: 300, name: 'Ogikubo', color: '#f97316' },
    ],
    lines: [
      {
        id: 'chuo-line',
        name: 'Chuo Line',
        color: '#f97316',
        tension: 0.3,
        stations: ['tokyo-c', 'kanda-c', 'ochanomizu', 'yotsuya', 'shinjuku-c', 'nakano', 'koenji', 'asagaya', 'ogikubo']
      }
    ]
  },
  {
    id: 'ginza',
    name: 'Ginza Line',
    description: 'Tokyo\'s oldest subway line',
    stations: [
      { id: 'shibuya-g', x: 150, y: 450, name: 'Shibuya', color: '#f59e0b' },
      { id: 'omotesando', x: 210, y: 420, name: 'Omotesando', color: '#f59e0b' },
      { id: 'gaiemmae', x: 270, y: 390, name: 'Gaiemmae', color: '#f59e0b' },
      { id: 'aoyama-itchome', x: 330, y: 360, name: 'Aoyama-itchome', color: '#f59e0b' },
      { id: 'akasaka-mitsuke', x: 390, y: 330, name: 'Akasaka-mitsuke', color: '#f59e0b' },
      { id: 'ginza-g', x: 450, y: 300, name: 'Ginza', color: '#f59e0b' },
      { id: 'nihombashi', x: 510, y: 270, name: 'Nihombashi', color: '#f59e0b' },
      { id: 'ueno-g', x: 570, y: 240, name: 'Ueno', color: '#f59e0b' },
      { id: 'asakusa', x: 630, y: 210, name: 'Asakusa', color: '#f59e0b' },
    ],
    lines: [
      {
        id: 'ginza-line',
        name: 'Ginza Line',
        color: '#f59e0b',
        tension: 0.6,
        stations: ['shibuya-g', 'omotesando', 'gaiemmae', 'aoyama-itchome', 'akasaka-mitsuke', 'ginza-g', 'nihombashi', 'ueno-g', 'asakusa']
      }
    ]
  },
  {
    id: 'simple',
    name: 'Simple Demo',
    description: 'A simple 4-station demo route',
    stations: [
      { id: 'station-1', x: 300, y: 200, name: 'Central Station', color: '#8b5cf6' },
      { id: 'station-2', x: 450, y: 200, name: 'North Station', color: '#8b5cf6' },
      { id: 'station-3', x: 450, y: 350, name: 'East Station', color: '#8b5cf6' },
      { id: 'station-4', x: 300, y: 350, name: 'South Station', color: '#8b5cf6' },
    ],
    lines: [
      {
        id: 'demo-line',
        name: 'Demo Line',
        color: '#8b5cf6',
        tension: 0.7,
        stations: ['station-1', 'station-2', 'station-3', 'station-4', 'station-1']
      }
    ]
  }
]
