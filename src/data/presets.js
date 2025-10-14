export const trainPresets = [
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
  },
  {
    id: 'yamanote',
    name: 'Yamanote Line',
    description: 'Japan',
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
    description: 'Japan',
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
    description: 'Japan',
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
    id: 'taiyokei',
    name: 'Taiyokei Line',
    description: 'Solar System train line from Mercury to Pluto in Japanese',
    stations: [
      { id: 'mercury', x: 100, y: 250, name: 'Mercury', color: '#000000' },
      { id: 'venus', x: 160, y: 220, name: 'Venus', color: '#000000' },
      { id: 'earth', x: 230, y: 200, name: 'Earth', color: '#000000' },
      { id: 'mars', x: 310, y: 190, name: 'Mars', color: '#000000' },
      { id: 'jupiter', x: 400, y: 200, name: 'Jupiter', color: '#000000' },
      { id: 'saturn', x: 490, y: 220, name: 'Saturn', color: '#000000' },
      { id: 'uranus', x: 570, y: 250, name: 'Uranus', color: '#000000' },
      { id: 'neptune', x: 640, y: 290, name: 'Neptune', color: '#000000' },
      { id: 'pluto', x: 700, y: 340, name: 'Pluto', color: '#000000' },
    ],
    lines: [
      {
        id: 'taiyokei-line',
        name: 'Taiyokei Line',
        color: '#000000',
        tension: 0.4,
        stations: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
      }
    ],
    audioAssignments: {
      'station-mercury': {
        type: 'preset',
        filename: 'Taioykei Mercury JP.mp3',
        name: 'Mercury Arrival',
        transcription: '太陽系線をご利用くださいまして、ありがとうございます。 この電車は、冥王星ゆきです。停車駅は、金星、地球中央駅、火星、木星、土星、天王星、海王星、冥王星です。次は金星です。'
      },
      'between-mercury-venus': {
        type: 'preset',
        filename: 'Taioykei Dep Mercury JP.mp3',
        name: 'Mercury Departure',
        transcription: '次は金星です。'
      },
      'station-venus': {
        type: 'preset',
        filename: 'Taioykei Venus JP.mp3',
        name: 'Venus Arrival',
        transcription: '金星。金星。'
      },
      'between-venus-earth': {
        type: 'preset',
        filename: 'Taioykei Dep Venus JP.mp3',
        name: 'Venus Departure',
        transcription: '次は地球中央駅です。'
      },
      'station-earth': {
        type: 'preset',
        filename: 'Taioykei Earth JP.mp3',
        name: 'Earth Arrival',
        transcription: '地球中央駅。地球中央駅。'
      },
      'between-earth-mars': {
        type: 'preset',
        filename: 'Taioykei Dep Earth JP.mp3',
        name: 'Earth Departure',
        transcription: '次は火星です。'
      },
      'station-mars': {
        type: 'preset',
        filename: 'Taioykei Mars JP.mp3',
        name: 'Mars Arrival',
        transcription: '火星。火星。'
      },
      'between-mars-jupiter': {
        type: 'preset',
        filename: 'Taioykei Dep Mars JP.mp3',
        name: 'Mars Departure',
        transcription: '次は木星です。'
      },
      'station-jupiter': {
        type: 'preset',
        filename: 'Taioykei Jupiter JP.mp3',
        name: 'Jupiter Arrival',
        transcription: '木星。木星。'
      },
      'between-jupiter-saturn': {
        type: 'preset',
        filename: 'Taioykei Dep Jupiter JP.mp3',
        name: 'Jupiter Departure',
        transcription: '次は土星です。'
      },
      'station-saturn': {
        type: 'preset',
        filename: 'Taioykei Saturn JP.mp3',
        name: 'Saturn Arrival',
        transcription: '土星。土星。'
      },
      'between-saturn-uranus': {
        type: 'preset',
        filename: 'Taioykei Dep Saturn JP.mp3',
        name: 'Saturn Departure',
        transcription: '次は天王星です。'
      },
      'station-uranus': {
        type: 'preset',
        filename: 'Taioykei Uranus JP.mp3',
        name: 'Uranus Arrival',
        transcription: '天王星。天王星。'
      },
      'between-uranus-neptune': {
        type: 'preset',
        filename: 'Taioykei Dep Uranus JP.mp3',
        name: 'Uranus Departure',
        transcription: '次は海王星です。'
      },
      'station-neptune': {
        type: 'preset',
        filename: 'Taioykei Neptune JP.mp3',
        name: 'Neptune Arrival',
        transcription: '海王星。海王星。'
      },
      'between-neptune-pluto': {
        type: 'preset',
        filename: 'Taioykei Dep Neptune JP.mp3',
        name: 'Neptune Departure',
        transcription: '次は冥王星です。'
      },
      'station-pluto': {
        type: 'preset',
        filename: 'Taioykei Pluto JP.mp3',
        name: 'Pluto Arrival',
        transcription: '冥王星。冥王星。'
      }
    }
  },
  {
    id: 'taiyokei-en',
    name: 'Taiyokei Line (English)',
    description: 'Solar System train line from Mercury to Pluto in English',
    stations: [
      { id: 'mercury-en', x: 100, y: 250, name: 'Mercury', color: '#4a5568' },
      { id: 'venus-en', x: 160, y: 220, name: 'Venus', color: '#4a5568' },
      { id: 'earth-en', x: 230, y: 200, name: 'Earth', color: '#4a5568' },
      { id: 'mars-en', x: 310, y: 190, name: 'Mars', color: '#4a5568' },
      { id: 'jupiter-en', x: 400, y: 200, name: 'Jupiter', color: '#4a5568' },
      { id: 'saturn-en', x: 490, y: 220, name: 'Saturn', color: '#4a5568' },
      { id: 'uranus-en', x: 570, y: 250, name: 'Uranus', color: '#4a5568' },
      { id: 'neptune-en', x: 640, y: 290, name: 'Neptune', color: '#4a5568' },
      { id: 'pluto-en', x: 700, y: 340, name: 'Pluto', color: '#4a5568' },
    ],
    lines: [
      {
        id: 'taiyokei-line-en',
        name: 'Taiyokei Line (EN)',
        color: '#4a5568',
        tension: 0.4,
        stations: ['mercury-en', 'venus-en', 'earth-en', 'mars-en', 'jupiter-en', 'saturn-en', 'uranus-en', 'neptune-en', 'pluto-en']
      }
    ],
    audioAssignments: {
      'station-mercury-en': {
        type: 'preset',
        filename: 'Taioykei Mercury EN.mp3',
        name: 'Mercury Arrival',
        transcription: 'Thank you for using the Taiyōkei Line. This train is bound for Pluto. We will stop at Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto. The next station is Venus.'
      },
      'between-mercury-en-venus-en': {
        type: 'preset',
        filename: 'Taioykei Dep Mercury EN.mp3',
        name: 'Mercury Departure',
        transcription: 'The next station is Venus.'
      },
      'station-venus-en': {
        type: 'preset',
        filename: 'Taioykei Venus EN.mp3',
        name: 'Venus Arrival',
        transcription: 'Venus. Venus.'
      },
      'between-venus-en-earth-en': {
        type: 'preset',
        filename: 'Taioykei Dep Venus EN.mp3',
        name: 'Venus Departure',
        transcription: 'The next station is Earth Central Station.'
      },
      'station-earth-en': {
        type: 'preset',
        filename: 'Taioykei Earth EN.mp3',
        name: 'Earth Arrival',
        transcription: 'Earth Central Station. Earth Central Station.'
      },
      'between-earth-en-mars-en': {
        type: 'preset',
        filename: 'Taioykei Dep Earth EN.mp3',
        name: 'Earth Departure',
        transcription: 'The next station is Mars.'
      },
      'station-mars-en': {
        type: 'preset',
        filename: 'Taioykei Mars EN.mp3',
        name: 'Mars Arrival',
        transcription: 'Mars. Mars.'
      },
      'between-mars-en-jupiter-en': {
        type: 'preset',
        filename: 'Taioykei Dep Mars EN.mp3',
        name: 'Mars Departure',
        transcription: 'The next station is Jupiter.'
      },
      'station-jupiter-en': {
        type: 'preset',
        filename: 'Taioykei Jupiter EN.mp3',
        name: 'Jupiter Arrival',
        transcription: 'Jupiter. Jupiter.'
      },
      'between-jupiter-en-saturn-en': {
        type: 'preset',
        filename: 'Taioykei Dep Jupiter EN.mp3',
        name: 'Jupiter Departure',
        transcription: 'The next station is Saturn.'
      },
      'station-saturn-en': {
        type: 'preset',
        filename: 'Taioykei Saturn EN.mp3',
        name: 'Saturn Arrival',
        transcription: 'Saturn. Saturn.'
      },
      'between-saturn-en-uranus-en': {
        type: 'preset',
        filename: 'Taioykei Dep Saturn EN.mp3',
        name: 'Saturn Departure',
        transcription: 'The next station is Uranus.'
      },
      'station-uranus-en': {
        type: 'preset',
        filename: 'Taioykei Uranus EN.mp3',
        name: 'Uranus Arrival',
        transcription: 'Uranus. Uranus.'
      },
      'between-uranus-en-neptune-en': {
        type: 'preset',
        filename: 'Taioykei Dep Uranus EN.mp3',
        name: 'Uranus Departure',
        transcription: 'The next station is Neptune.'
      },
      'station-neptune-en': {
        type: 'preset',
        filename: 'Taioykei Neptune EN.mp3',
        name: 'Neptune Arrival',
        transcription: 'Neptune. Neptune.'
      },
      'between-neptune-en-pluto-en': {
        type: 'preset',
        filename: 'Taioykei Dep Neptune EN.mp3',
        name: 'Neptune Departure',
        transcription: 'The next station is Pluto.'
      },
      'station-pluto-en': {
        type: 'preset',
        filename: 'Taioykei Pluto EN.mp3',
        name: 'Pluto Arrival',
        transcription: 'Pluto. Pluto.'
      }
    }
  }
]
