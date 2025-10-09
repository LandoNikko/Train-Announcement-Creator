// Audio presets are loaded from the public folder
// Files are assigned to stations in order they appear

// Get base URL from Vite (handles both local and GitHub Pages paths)
const getBasePath = () => {
  return import.meta.env.BASE_URL || '/'
}

const getPresetPath = (filename) => {
  const base = getBasePath()
  return `${base}audio/presets/${filename}`.replace(/\/\//g, '/')
}

export const getAvailablePresets = async () => {
  const presetFiles = [
    'shinjuku1bansen-jihatu.mp3',
    'shinjuku1bansen-sekkin.mp3',
    'shinjuku1bansen-totyaku.mp3'
  ]
  
  return presetFiles.map((filename, index) => ({
    id: `preset-${index}`,
    name: filename.replace('.mp3', ''),
    path: getPresetPath(filename),
    index: index
  }))
}

// Get a preset by index (cycles through available presets)
export const getPresetByIndex = (index) => {
  const presetFiles = [
    'shinjuku1bansen-jihatu.mp3',
    'shinjuku1bansen-sekkin.mp3',
    'shinjuku1bansen-totyaku.mp3'
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

// Get all preset files
export const getAllPresets = () => {
  const presetFiles = [
    'shinjuku1bansen-jihatu.mp3',
    'shinjuku1bansen-sekkin.mp3',
    'shinjuku1bansen-totyaku.mp3'
  ]
  
  return presetFiles.map((filename, index) => ({
    id: `preset-${index}`,
    name: filename.replace('.mp3', ''),
    path: getPresetPath(filename),
    index: index
  }))
}