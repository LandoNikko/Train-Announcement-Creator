import { Trash2, Shuffle } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { useState } from 'react'
import { translations } from '../../locales/translations'

const LineStationEditor = ({ 
  station,
  line,
  lines = [],
  stations = [],
  onUpdateStation,
  onUpdateLine,
  onDeleteStation,
  onDeleteLine,
  onClose,
  language = 'en',
  setStationsAndLines
}) => {
  const { t } = useTranslation(language)
  const [isShufflingStationColor, setIsShufflingStationColor] = useState(false)
  const [isShufflingLineColor, setIsShufflingLineColor] = useState(false)
  const [isShufflingStationName, setIsShufflingStationName] = useState(false)
  const [isShufflingLineName, setIsShufflingLineName] = useState(false)

  // Find the line that this station belongs to (if station is selected)
  // Use the most up-to-date line from lines array
  const stationLineId = station ? lines.find(l => l.stations?.includes(station.id))?.id : null
  const stationLine = stationLineId ? lines.find(l => l.id === stationLineId) : null
  const activeLineId = line?.id || stationLineId
  const activeLine = lines.find(l => l.id === activeLineId)

  const handleStationNameChange = (e) => {
    if (station && onUpdateStation) {
      const updatedStation = { ...station, name: e.target.value }
      onUpdateStation(updatedStation)
    }
  }

  const handleStationColorChange = (newColor) => {
    if (station && onUpdateStation) {
      const updatedStation = { ...station, color: newColor }
      onUpdateStation(updatedStation)
    }
  }

  const handleLineNameChange = (e) => {
    if (activeLine && onUpdateLine) {
      const updatedLine = { ...activeLine, name: e.target.value }
      onUpdateLine(updatedLine)
    }
  }

  const handleLineColorChange = (newColor) => {
    if (activeLine) {
      const updatedLine = { ...activeLine, color: newColor }
      const updatedLines = lines.map(l => l.id === updatedLine.id ? updatedLine : l)
      
      // Update all connected stations atomically for proper history tracking
      if (updatedLine.stations && setStationsAndLines) {
        const updatedStations = stations.map(s => 
          updatedLine.stations.includes(s.id) 
            ? { ...s, color: newColor }
            : s
        )
        setStationsAndLines(updatedStations, updatedLines)
      } else if (onUpdateLine) {
        // Fallback to old method if setStationsAndLines not available
        onUpdateLine(updatedLine, true)
      }
    }
  }

  const handleCustomColorChange = (e, isStationColor) => {
    if (isStationColor) {
      handleStationColorChange(e.target.value)
    } else {
      handleLineColorChange(e.target.value)
    }
  }

  // Generate random name
  const randomizeName = (isStationName) => {
    // Trigger animation for the specific input
    if (isStationName) {
      setIsShufflingStationName(true)
      setTimeout(() => setIsShufflingStationName(false), 200)
    } else {
      setIsShufflingLineName(true)
      setTimeout(() => setIsShufflingLineName(false), 200)
    }
    
    // Get presets from translations
    const presets = isStationName 
      ? translations[language]?.stationNamePresets || translations.en.stationNamePresets
      : translations[language]?.lineNamePresets || translations.en.lineNamePresets
    
    const randomName = presets[Math.floor(Math.random() * presets.length)]
    
    if (isStationName) {
      if (station && onUpdateStation) {
        const updatedStation = { ...station, name: randomName }
        onUpdateStation(updatedStation)
      }
    } else {
      if (activeLine && onUpdateLine) {
        const updatedLine = { ...activeLine, name: randomName }
        onUpdateLine(updatedLine)
      }
    }
  }

  // Generate random color
  const randomizeColor = (isStationColor) => {
    // Trigger animation for the specific button
    if (isStationColor) {
      setIsShufflingStationColor(true)
      setTimeout(() => setIsShufflingStationColor(false), 200)
    } else {
      setIsShufflingLineColor(true)
      setTimeout(() => setIsShufflingLineColor(false), 200)
    }
    
    const h = Math.floor(Math.random() * 360)
    const s = Math.floor(Math.random() * 60) + 20 // 20-80% saturation
    const l = Math.floor(Math.random() * 60) + 20 // 20-80% lightness
    
    // Convert HSL to hex
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
    
    const randomColor = hslToHex(h, s, l)
    
    if (isStationColor) {
      handleStationColorChange(randomColor)
    } else {
      handleLineColorChange(randomColor)
    }
  }

  const renderSection = (title, nameValue, colorValue, onNameChange, onColorChange, onDelete, deleteId) => {
    const isStationColor = title === t('editStation')
    
    return (
      <div className="p-3 rounded-lg border border-transparent" style={{ backgroundColor: 'var(--btn-unselected-bg)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
            {title}
            {onDelete && (
              <button 
                onClick={() => onDelete(deleteId)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title={t('delete')}
              >
                <Trash2 size={14} />
              </button>
            )}
          </h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              {t('name')}
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={nameValue}
                onChange={onNameChange}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => randomizeName(isStationColor)}
                className="flex-shrink-0 w-[34px] h-[34px] flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                title="Randomize name"
              >
                <Shuffle 
                  size={16} 
                  className={`text-gray-700 dark:text-gray-300 transition-transform ${
                    (isStationColor && isShufflingStationName) || (!isStationColor && isShufflingLineName) 
                      ? 'animate-shuffle' 
                      : ''
                  }`}
                />
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
              {t('color')}
            </label>
            
            {/* Color picker with randomize button */}
            <div className="flex gap-1.5">
              <label 
                className="relative flex-1 h-[34px] rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                style={{ backgroundColor: colorValue }}
              >
                <input
                  type="color"
                  value={colorValue}
                  onChange={(e) => handleCustomColorChange(e, isStationColor)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
              
              <button
                onClick={() => randomizeColor(isStationColor)}
                className="flex-shrink-0 w-[34px] h-[34px] flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                title="Randomize color"
              >
                <Shuffle 
                  size={16} 
                  className={`text-gray-700 dark:text-gray-300 transition-transform ${
                    (isStationColor && isShufflingStationColor) || (!isStationColor && isShufflingLineColor) 
                      ? 'animate-shuffle' 
                      : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get fresh station data from stations array to ensure color is up-to-date
  const freshStation = station ? stations.find(s => s.id === station.id) || station : null

  return (
    <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-72 z-10 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="space-y-3" style={{ '--editor-section-bg': 'var(--btn-unselected-bg)' }}>
        {freshStation && renderSection(
          t('editStation'),
          freshStation.name,
          freshStation.color,
          handleStationNameChange,
          handleStationColorChange,
          onDeleteStation,
          freshStation.id
        )}

        {activeLine && renderSection(
          t('editLine'),
          activeLine.name,
          activeLine.color,
          handleLineNameChange,
          handleLineColorChange,
          line ? onDeleteLine : null,
          activeLine.id
        )}
      </div>

      <button
        onClick={onClose}
        className="w-full px-3 py-2 mt-4 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-lg transition-colors text-sm border border-gray-300 dark:border-gray-600"
      >
        {t('close')}
      </button>
    </div>
  )
}

export default LineStationEditor
