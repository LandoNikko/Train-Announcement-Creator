// Audio presets are loaded from the public folder
// Files are assigned to stations in order they appear

export const getAvailablePresets = async () => {
  const presetFiles = [
    '/audio/presets/shinjuku1bansen-jihatu.mp3',
    '/audio/presets/shinjuku1bansen-sekkin.mp3',
    '/audio/presets/shinjuku1bansen-totyaku.mp3'
  ]
  
  return presetFiles.map((path, index) => ({
    id: `preset-${index}`,
    name: path.split('/').pop().replace('.mp3', ''),
    path: path,
    index: index
  }))
}

// Get a preset by index (cycles through available presets)
export const getPresetByIndex = (index) => {
  const presetFiles = [
    '/audio/presets/shinjuku1bansen-jihatu.mp3',
    '/audio/presets/shinjuku1bansen-sekkin.mp3',
    '/audio/presets/shinjuku1bansen-totyaku.mp3'
  ]
  
  const cycledIndex = index % presetFiles.length
  const path = presetFiles[cycledIndex]
  
  return {
    id: `preset-${cycledIndex}`,
    name: path.split('/').pop().replace('.mp3', ''),
    path: path,
    index: cycledIndex
  }
}

// Get all preset files
export const getAllPresets = () => {
  return [
    '/audio/presets/shinjuku1bansen-jihatu.mp3',
    '/audio/presets/shinjuku1bansen-sekkin.mp3',
    '/audio/presets/shinjuku1bansen-totyaku.mp3'
  ].map((path, index) => ({
    id: `preset-${index}`,
    name: path.split('/').pop().replace('.mp3', ''),
    path: path,
    index: index
  }))
}