import { Trash2, Palette } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

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
  language = 'en'
}) => {
  const { t } = useTranslation(language)

  const predefinedColors = [
    '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', 
    '#06b6d4', '#f97316', '#84cc16', '#a855f7', '#14b8a6', '#f43f5e'
  ]

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
    if (activeLine && onUpdateLine) {
      const updatedLine = { ...activeLine, color: newColor }
      // Pass true to indicate station colors should also be updated
      onUpdateLine(updatedLine, true)
    }
  }

  const handleCustomColorChange = (e, isStationColor) => {
    if (isStationColor) {
      handleStationColorChange(e.target.value)
    } else {
      handleLineColorChange(e.target.value)
    }
  }

  const renderSection = (title, nameValue, colorValue, onNameChange, onColorChange, onDelete, deleteId) => (
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
          <input
            type="text"
            value={nameValue}
            onChange={onNameChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
            {t('color')}
          </label>
          <div className="grid grid-cols-6 gap-2 mb-3">
            {predefinedColors.map(c => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                className={`w-9 h-9 rounded-lg transition-all hover:scale-110 ${
                  colorValue === c ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800' : ''
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Palette size={14} className="text-gray-500 dark:text-gray-400" />
            <input
              type="color"
              value={colorValue}
              onChange={(e) => handleCustomColorChange(e, title === t('editStation'))}
              className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              value={colorValue}
              onChange={(e) => handleCustomColorChange(e, title === t('editStation'))}
              placeholder="#000000"
              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-72 z-10 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="space-y-3" style={{ '--editor-section-bg': 'var(--btn-unselected-bg)' }}>
        {station && renderSection(
          t('editStation'),
          station.name,
          station.color,
          handleStationNameChange,
          handleStationColorChange,
          onDeleteStation,
          station.id
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

