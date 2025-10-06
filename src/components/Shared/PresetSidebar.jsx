import { Map, Circle, ArrowRight, X } from 'lucide-react'
import { trainPresets } from '../../data/presets'
import { useTranslation } from '../../hooks/useTranslation'

const PresetSidebar = ({ onLoadPreset, currentPresetId, language = 'en', isMobile, onClose }) => {
  const { t } = useTranslation(language)
  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Map size={20} />
            {t('trainLinePresets')}
          </h2>
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('loadPresetHint')}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {trainPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onLoadPreset(preset)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:border-blue-400 hover:shadow-md ${
              currentPresetId === preset.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                  {t(preset.name)}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  {t(preset.description)}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <Circle size={12} />
                  <span>{preset.stations.length} {t('stations')}</span>
                </div>
              </div>
              {currentPresetId === preset.id ? (
                <div className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                  {t('active')}
                </div>
              ) : (
                <ArrowRight size={16} className="ml-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          💡 {t('clickPresetToLoad')}
        </p>
      </div>
    </div>
  )
}

export default PresetSidebar
