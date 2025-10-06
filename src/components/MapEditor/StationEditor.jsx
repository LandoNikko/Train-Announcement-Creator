import { X, Trash2 } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

const StationEditor = ({ station, onUpdate, onDelete, onClose, language = 'en' }) => {
  const { t } = useTranslation(language)

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'
  ]

  const handleNameChange = (e) => {
    onUpdate({ ...station, name: e.target.value })
  }

  const handleColorChange = (newColor) => {
    onUpdate({ ...station, color: newColor })
  }

  return (
    <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-64 z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 dark:text-gray-200">{t('editStation')}</h3>
        <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">{t('stationName')}</label>
          <input
            type="text"
            value={station.name}
            onChange={handleNameChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">{t('stationColor')}</label>
          <div className="flex gap-2">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => handleColorChange(c)}
                className={`w-8 h-8 rounded-full transition-all ${
                  station.color === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => onDelete(station.id)}
            className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 size={18} />
            <span>{t('delete')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default StationEditor
