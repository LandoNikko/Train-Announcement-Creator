// Audio presets are loaded from the public folder
// Files are assigned to stations in order they appear

// Get base URL from Vite (handles both local and GitHub Pages paths)
const getBasePath = () => {
  return import.meta.env.BASE_URL || '/'
}

export const getPresetPath = (filename) => {
  const base = getBasePath()
  return `${base}audio/presets/${filename}`.replace(/\/\//g, '/')
}

export const getAvailablePresets = async () => {
  const presetFiles = [
    'shinjuku1bansen-jihatu.mp3',
    'shinjuku1bansen-sekkin.mp3',
    'shinjuku1bansen-totyaku.mp3',
    'Taioykei Mercury JP.mp3',
    'Taioykei Dep Mercury JP.mp3',
    'Taioykei Venus JP.mp3',
    'Taioykei Dep Venus JP.mp3',
    'Taioykei Earth JP.mp3',
    'Taioykei Dep Earth JP.mp3',
    'Taioykei Mars JP.mp3',
    'Taioykei Dep Mars JP.mp3',
    'Taioykei Jupiter JP.mp3',
    'Taioykei Dep Jupiter JP.mp3',
    'Taioykei Saturn JP.mp3',
    'Taioykei Dep Saturn JP.mp3',
    'Taioykei Uranus JP.mp3',
    'Taioykei Dep Uranus JP.mp3',
    'Taioykei Neptune JP.mp3',
    'Taioykei Dep Neptune JP.mp3',
    'Taioykei Pluto JP.mp3',
    'Taioykei Mercury EN.mp3',
    'Taioykei Dep Mercury EN.mp3',
    'Taioykei Venus EN.mp3',
    'Taioykei Dep Venus EN.mp3',
    'Taioykei Earth EN.mp3',
    'Taioykei Dep Earth EN.mp3',
    'Taioykei Mars EN.mp3',
    'Taioykei Dep Mars EN.mp3',
    'Taioykei Jupiter EN.mp3',
    'Taioykei Dep Jupiter EN.mp3',
    'Taioykei Saturn EN.mp3',
    'Taioykei Dep Saturn EN.mp3',
    'Taioykei Uranus EN.mp3',
    'Taioykei Dep Uranus EN.mp3',
    'Taioykei Neptune EN.mp3',
    'Taioykei Dep Neptune EN.mp3',
    'Taioykei Pluto EN.mp3'
  ]
  
  return presetFiles.map((filename, index) => ({
    id: `preset-${index}`,
    name: filename.replace('.mp3', ''),
    path: getPresetPath(filename),
    index: index
  }))
}

export const getPresetByIndex = (index) => {
  const presetFiles = [
    'shinjuku1bansen-jihatu.mp3',
    'shinjuku1bansen-sekkin.mp3',
    'shinjuku1bansen-totyaku.mp3',
    'Taioykei Mercury JP.mp3',
    'Taioykei Dep Mercury JP.mp3',
    'Taioykei Venus JP.mp3',
    'Taioykei Dep Venus JP.mp3',
    'Taioykei Earth JP.mp3',
    'Taioykei Dep Earth JP.mp3',
    'Taioykei Mars JP.mp3',
    'Taioykei Dep Mars JP.mp3',
    'Taioykei Jupiter JP.mp3',
    'Taioykei Dep Jupiter JP.mp3',
    'Taioykei Saturn JP.mp3',
    'Taioykei Dep Saturn JP.mp3',
    'Taioykei Uranus JP.mp3',
    'Taioykei Dep Uranus JP.mp3',
    'Taioykei Neptune JP.mp3',
    'Taioykei Dep Neptune JP.mp3',
    'Taioykei Pluto JP.mp3',
    'Taioykei Mercury EN.mp3',
    'Taioykei Dep Mercury EN.mp3',
    'Taioykei Venus EN.mp3',
    'Taioykei Dep Venus EN.mp3',
    'Taioykei Earth EN.mp3',
    'Taioykei Dep Earth EN.mp3',
    'Taioykei Mars EN.mp3',
    'Taioykei Dep Mars EN.mp3',
    'Taioykei Jupiter EN.mp3',
    'Taioykei Dep Jupiter EN.mp3',
    'Taioykei Saturn EN.mp3',
    'Taioykei Dep Saturn EN.mp3',
    'Taioykei Uranus EN.mp3',
    'Taioykei Dep Uranus EN.mp3',
    'Taioykei Neptune EN.mp3',
    'Taioykei Dep Neptune EN.mp3',
    'Taioykei Pluto EN.mp3'
  ]
  
  const cycledIndex = index % presetFiles.length
  const filename = presetFiles[cycledIndex]
  
  return {
    id: `preset-${cycledIndex}`,
    name: filename.replace('.mp3', ''),
    path: getPresetPath(filename),
    index: cycledIndex
  }
}

export const getAllPresets = () => {
  const presetFiles = [
    'shinjuku1bansen-jihatu.mp3',
    'shinjuku1bansen-sekkin.mp3',
    'shinjuku1bansen-totyaku.mp3',
    'Taioykei Mercury JP.mp3',
    'Taioykei Dep Mercury JP.mp3',
    'Taioykei Venus JP.mp3',
    'Taioykei Dep Venus JP.mp3',
    'Taioykei Earth JP.mp3',
    'Taioykei Dep Earth JP.mp3',
    'Taioykei Mars JP.mp3',
    'Taioykei Dep Mars JP.mp3',
    'Taioykei Jupiter JP.mp3',
    'Taioykei Dep Jupiter JP.mp3',
    'Taioykei Saturn JP.mp3',
    'Taioykei Dep Saturn JP.mp3',
    'Taioykei Uranus JP.mp3',
    'Taioykei Dep Uranus JP.mp3',
    'Taioykei Neptune JP.mp3',
    'Taioykei Dep Neptune JP.mp3',
    'Taioykei Pluto JP.mp3',
    'Taioykei Mercury EN.mp3',
    'Taioykei Dep Mercury EN.mp3',
    'Taioykei Venus EN.mp3',
    'Taioykei Dep Venus EN.mp3',
    'Taioykei Earth EN.mp3',
    'Taioykei Dep Earth EN.mp3',
    'Taioykei Mars EN.mp3',
    'Taioykei Dep Mars EN.mp3',
    'Taioykei Jupiter EN.mp3',
    'Taioykei Dep Jupiter EN.mp3',
    'Taioykei Saturn EN.mp3',
    'Taioykei Dep Saturn EN.mp3',
    'Taioykei Uranus EN.mp3',
    'Taioykei Dep Uranus EN.mp3',
    'Taioykei Neptune EN.mp3',
    'Taioykei Dep Neptune EN.mp3',
    'Taioykei Pluto EN.mp3'
  ]
  
  return presetFiles.map((filename, index) => ({
    id: `preset-${index}`,
    name: filename.replace('.mp3', ''),
    path: getPresetPath(filename),
    index: index
  }))
}