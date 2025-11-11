import { useState, useMemo } from 'react'
import { X, Plus, Minus, Shuffle } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { translations } from '../../locales/translations'

const CreateLineModal = ({ onClose, onCreate, language = 'en', lineStyle = 'smooth' }) => {
  const { t } = useTranslation(language)
  const [stationCount, setStationCount] = useState(7)
  const [lineName, setLineName] = useState('New Transit System')
  const [lineColor, setLineColor] = useState('#8b5cf6')
  const [isLoop, setIsLoop] = useState(false)
  const [isShufflingName, setIsShufflingName] = useState(false)
  const [isShufflingColor, setIsShufflingColor] = useState(false)
  const [pathShape, setPathShape] = useState('line') // 'line', 'curve', 's', 'random'
  const [pathRotation, setPathRotation] = useState(0) // 0, 90, 180, 270 degrees
  const [stationPositions, setStationPositions] = useState([])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleCreateEmpty = () => {
    onCreate(0, lineName, lineColor, isLoop, [])
  }

  const handleCreateWithStations = () => {
    // Convert normalized positions to grid indices
    const baseSpacing = 30
    const minGridIndex = 3
    const maxGridIndex = 20
    const gridRange = maxGridIndex - minGridIndex
    
    const gridPositions = stationPositions.map(pos => ({
      gridIndexX: Math.round(minGridIndex + pos.x * gridRange),
      gridIndexY: Math.round(minGridIndex + pos.y * gridRange)
    }))
    
    onCreate(stationCount, lineName, lineColor, isLoop, gridPositions)
  }

  const randomizeName = () => {
    setIsShufflingName(true)
    setTimeout(() => setIsShufflingName(false), 200)
    
    const presets = translations[language]?.lineNamePresets || translations.en.lineNamePresets
    const randomName = presets[Math.floor(Math.random() * presets.length)]
    setLineName(randomName)
  }

  const randomizeColor = () => {
    setIsShufflingColor(true)
    setTimeout(() => setIsShufflingColor(false), 200)
    
    const h = Math.floor(Math.random() * 360)
    const s = Math.floor(Math.random() * 60) + 20
    const l = Math.floor(Math.random() * 60) + 20
    
    const hslToHex = (h, s, l) => {
      s /= 100
      l /= 100
      const a = s * Math.min(l, 1 - l)
      const f = (n) => {
        const k = (n + h / 30) % 12
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
        return Math.round(255 * color).toString(16).padStart(2, '0')
      }
      return `#${f(0)}${f(8)}${f(4)}`
    }
    
    setLineColor(hslToHex(h, s, l))
  }

  const incrementStations = () => {
    setStationCount(prev => Math.min(prev + 1, 50))
  }

  const decrementStations = () => {
    setStationCount(prev => Math.max(prev - 1, 0))
  }

  // Generate station positions based on shape and loop settings
  const generatePositions = (count, loop, shape, rotation = 0) => {
    if (count === 0) return []
    
    const positions = []
    const centerX = 0.5
    const centerY = 0.5
    
    if (loop) {
      // Loop variations based on shape
      const angleStep = (2 * Math.PI) / count
      
      if (shape === 'line') {
        // Perfect circle
        const radius = 0.35
        for (let i = 0; i < count; i++) {
          const angle = i * angleStep - Math.PI / 2
          positions.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          })
        }
      } else if (shape === 'curve') {
        // Oval/ellipse (wider horizontally)
        const radiusX = 0.4
        const radiusY = 0.3
        for (let i = 0; i < count; i++) {
          const angle = i * angleStep - Math.PI / 2
          positions.push({
            x: centerX + radiusX * Math.cos(angle),
            y: centerY + radiusY * Math.sin(angle)
          })
        }
      } else if (shape === 's') {
        // Rounded rectangle
        const width = 0.35
        const height = 0.25
        for (let i = 0; i < count; i++) {
          const t = i / count
          let x, y
          if (t < 0.25) {
            // Top edge
            const edge = t / 0.25
            x = centerX - width + edge * (width * 2)
            y = centerY - height
          } else if (t < 0.5) {
            // Right edge
            const edge = (t - 0.25) / 0.25
            x = centerX + width
            y = centerY - height + edge * (height * 2)
          } else if (t < 0.75) {
            // Bottom edge
            const edge = (t - 0.5) / 0.25
            x = centerX + width - edge * (width * 2)
            y = centerY + height
          } else {
            // Left edge
            const edge = (t - 0.75) / 0.25
            x = centerX - width
            y = centerY + height - edge * (height * 2)
          }
          positions.push({ x, y })
        }
      } else {
        // Random loop - irregular shape with slight variations
        const baseRadius = 0.35
        for (let i = 0; i < count; i++) {
          const angle = i * angleStep - Math.PI / 2
          const radiusVariation = 0.85 + Math.random() * 0.3
          const radius = baseRadius * radiusVariation
          const angleNoise = (Math.random() - 0.5) * 0.1
          positions.push({
            x: centerX + radius * Math.cos(angle + angleNoise),
            y: centerY + radius * Math.sin(angle + angleNoise)
          })
        }
      }
    } else {
      // Non-loop variations
      if (shape === 'line') {
        // Straight horizontal line
        for (let i = 0; i < count; i++) {
          const t = i / (count - 1 || 1)
          positions.push({
            x: 0.1 + t * 0.8,
            y: centerY
          })
        }
      } else if (shape === 'curve') {
        // Gentle downward curve (parabola)
        for (let i = 0; i < count; i++) {
          const t = i / (count - 1 || 1)
          const curveAmount = 0.2
          positions.push({
            x: 0.1 + t * 0.8,
            y: centerY + Math.pow(t - 0.5, 2) * curveAmount * 4
          })
        }
      } else if (shape === 's') {
        // S-curve
        for (let i = 0; i < count; i++) {
          const t = i / (count - 1 || 1)
          const curveAmount = 0.2
          positions.push({
            x: 0.15 + t * 0.7,
            y: centerY + Math.sin(t * Math.PI * 2 - Math.PI / 2) * curveAmount
          })
        }
      } else {
        // Random path with more variation in placement and distances
        const startX = 0.1 + Math.random() * 0.15
        const startY = 0.2 + Math.random() * 0.3
        const endX = 0.6 + Math.random() * 0.25
        const endY = 0.2 + Math.random() * 0.6
        
        for (let i = 0; i < count; i++) {
          const t = i / (count - 1 || 1)
          // More variation in positioning
          const noise = (Math.random() - 0.5) * 0.12
          // Variable spacing between stations
          const spacing = 0.7 + Math.random() * 0.6
          const adjustedT = Math.pow(t, spacing)
          positions.push({
            x: startX + (endX - startX) * adjustedT + noise,
            y: startY + (endY - startY) * adjustedT + noise
          })
        }
      }
    }
    
    // Apply rotation
    if (rotation !== 0) {
      const radians = (rotation * Math.PI) / 180
      const cos = Math.cos(radians)
      const sin = Math.sin(radians)
      
      return positions.map(pos => {
        const dx = pos.x - centerX
        const dy = pos.y - centerY
        return {
          x: centerX + dx * cos - dy * sin,
          y: centerY + dx * sin + dy * cos
        }
      })
    }
    
    return positions
  }

  // Update positions when station count, loop, shape, or rotation changes
  useMemo(() => {
    setStationPositions(generatePositions(stationCount, isLoop, pathShape, pathRotation))
  }, [stationCount, isLoop, pathShape, pathRotation])

  // Handle shape button click - rotate if clicking same shape
  const handleShapeClick = (shape) => {
    if (shape === pathShape && shape !== 'random') {
      // Rotate 90 degrees
      setPathRotation((prev) => (prev + 90) % 360)
    } else if (shape === 'random') {
      // Random: regenerate with random rotation
      setPathShape(shape)
      setPathRotation(Math.floor(Math.random() * 4) * 90)
    } else {
      // New shape: reset rotation
      setPathShape(shape)
      setPathRotation(0)
    }
  }

  // Generate SVG path based on line style
  const generateSVGPath = () => {
    if (stationPositions.length < 2) return ''
    
    if (lineStyle === 'direct') {
      // Straight lines between points
      const pathParts = stationPositions.map((p, i) => 
        i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`
      )
      return pathParts.join(' ') + (isLoop ? ' Z' : '')
    } else if (lineStyle === 'minimal') {
      // Right-angled corners
      const pathParts = [`M ${stationPositions[0].x},${stationPositions[0].y}`]
      for (let i = 1; i < stationPositions.length; i++) {
        const prev = stationPositions[i - 1]
        const curr = stationPositions[i]
        const dx = Math.abs(curr.x - prev.x)
        const dy = Math.abs(curr.y - prev.y)
        
        if (dx > dy) {
          pathParts.push(`L ${curr.x},${prev.y}`)
          pathParts.push(`L ${curr.x},${curr.y}`)
        } else {
          pathParts.push(`L ${prev.x},${curr.y}`)
          pathParts.push(`L ${curr.x},${curr.y}`)
        }
      }
      if (isLoop) {
        const first = stationPositions[0]
        const last = stationPositions[stationPositions.length - 1]
        const dx = Math.abs(first.x - last.x)
        const dy = Math.abs(first.y - last.y)
        if (dx > dy) {
          pathParts.push(`L ${first.x},${last.y}`)
        } else {
          pathParts.push(`L ${last.x},${first.y}`)
        }
        pathParts.push('Z')
      }
      return pathParts.join(' ')
    } else {
      // Smooth curves (Catmull-Rom approximation)
      const pathParts = [`M ${stationPositions[0].x},${stationPositions[0].y}`]
      for (let i = 0; i < stationPositions.length - 1; i++) {
        const p0 = stationPositions[Math.max(0, i - 1)]
        const p1 = stationPositions[i]
        const p2 = stationPositions[i + 1]
        const p3 = stationPositions[Math.min(stationPositions.length - 1, i + 2)]
        
        const cp1x = p1.x + (p2.x - p0.x) / 6
        const cp1y = p1.y + (p2.y - p0.y) / 6
        const cp2x = p2.x - (p3.x - p1.x) / 6
        const cp2y = p2.y - (p3.y - p1.y) / 6
        
        pathParts.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`)
      }
      if (isLoop) pathParts.push('Z')
      return pathParts.join(' ')
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t('createCustomLine')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {t('createCustomLineDescription')}
        </p>

        {/* Name */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            {t('name')}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={lineName}
                onChange={(e) => setLineName(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={randomizeName}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                title={t('randomizeName')}
              >
                <Shuffle 
                  size={16} 
                  className={`transition-transform ${
                    isShufflingName ? 'animate-shuffle' : ''
                  }`}
                />
              </button>
            </div>
            <div className="flex">
              <label 
                className="relative w-10 h-10 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 cursor-pointer overflow-hidden hover:opacity-80 transition-opacity flex-shrink-0"
                style={{ backgroundColor: lineColor }}
              >
                <input
                  type="color"
                  value={lineColor}
                  onChange={(e) => setLineColor(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
              <button
                onClick={randomizeColor}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-r-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                title={t('randomizeColor')}
              >
                <Shuffle 
                  size={16} 
                  className={`text-gray-700 dark:text-gray-300 transition-transform ${
                    isShufflingColor ? 'animate-shuffle' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Stations */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('stations')}
            </label>
            <div className="flex">
              <button
                onClick={decrementStations}
                className="w-10 h-10 flex items-center justify-center rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                disabled={stationCount <= 0}
              >
                <Minus size={16} className="text-gray-700 dark:text-gray-300" />
              </button>
              
              <input
                type="number"
                value={stationCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0
                  setStationCount(Math.max(0, Math.min(50, val)))
                }}
                min="0"
                max="50"
                className="w-16 h-10 px-2 text-center border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              
              <button
                onClick={incrementStations}
                className="w-10 h-10 flex items-center justify-center rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                disabled={stationCount >= 50}
              >
                <Plus size={16} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Loop Line Toggle */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('loopLine')}
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={isLoop}
              onClick={() => setIsLoop(!isLoop)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isLoop ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isLoop ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Path Shape Selection */}
        {stationCount > 0 && (
          <div className="mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              {t('pathShape')}
            </label>
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => handleShapeClick('line')}
                className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                  pathShape === 'line'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {t('pathLine')}
              </button>
              <button
                onClick={() => handleShapeClick('curve')}
                className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                  pathShape === 'curve'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {t('pathCurve')}
              </button>
              <button
                onClick={() => handleShapeClick('s')}
                className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                  pathShape === 's'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {t('pathS')}
              </button>
              <button
                onClick={() => handleShapeClick('random')}
                className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                  pathShape === 'random'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {t('pathRandom')}
              </button>
            </div>
          </div>
        )}

        {/* Preview Visualization */}
        {stationCount > 0 && (
          <div className="mb-4 relative">
            <div className="relative w-full h-32 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <svg
                viewBox="0 0 1 1"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full"
              >
                {/* Draw line path */}
                {stationPositions.length > 1 && (
                  <path
                    d={generateSVGPath()}
                    stroke={lineColor}
                    strokeWidth="0.015"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                
                {/* Draw stations */}
                {stationPositions.map((pos, i) => (
                  <circle
                    key={i}
                    cx={pos.x}
                    cy={pos.y}
                    r="0.025"
                    fill="white"
                    stroke={lineColor}
                    strokeWidth="0.008"
                  />
                ))}
              </svg>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleCreateWithStations}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('create')}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateLineModal

