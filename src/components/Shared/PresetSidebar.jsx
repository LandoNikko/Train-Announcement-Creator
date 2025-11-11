import { Map, Circle, ArrowRight, X, Plus } from 'lucide-react'
import { trainPresets } from '../../data/presets'
import { useTranslation } from '../../hooks/useTranslation'

const PresetSidebar = ({ onLoadPreset, currentPresetId, language = 'en', isMobile, onClose, customTransitSystems = [], setCustomTransitSystems, onCreateEmpty }) => {
  const { t } = useTranslation(language)
  const allPresets = [...customTransitSystems, ...trainPresets]
  const currentPreset = allPresets.find(p => p.id === currentPresetId)
  
  const handleDeleteCustomTransitSystem = (e, systemId) => {
    e.stopPropagation()
    if (setCustomTransitSystems) {
      // If deleting the currently active system, load Simple Demo
      if (systemId === currentPresetId) {
        const simpleDemo = trainPresets.find(p => p.id === 'simple')
        if (simpleDemo && onLoadPreset) {
          onLoadPreset(simpleDemo)
        }
      }
      setCustomTransitSystems(prev => prev.filter(p => p.id !== systemId))
    }
  }
  
  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
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
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t('custom')}
          </div>
          {onCreateEmpty && (
            <button
              onClick={onCreateEmpty}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={t('createEmpty')}
            >
              <Plus size={14} className="text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
        {customTransitSystems.length > 0 && (
          <>
            {customTransitSystems.map((preset) => (
              <div key={preset.id} className="relative group">
                <button
                  onClick={(e) => handleDeleteCustomTransitSystem(e, preset.id)}
                  className="absolute left-0 top-0 bottom-0 w-4 hover:bg-red-100 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-10 -ml-4"
                  style={{ marginLeft: '-1rem' }}
                  title={t('delete')}
                >
                  <X size={12} className="text-red-500" />
                </button>
                <button
                  onClick={() => onLoadPreset(preset)}
                  className={`w-full text-left p-3 rounded-lg transition-all hover:border-blue-400 hover:shadow-md relative ${
                    currentPresetId === preset.id ? 'btn-selected' : 'btn-unselected'
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                        {preset.isCopy ? `${t(preset.nameKey || preset.name)} (${t('copy')})` : preset.name}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {currentPresetId === preset.id ? (
                          <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded">
                            {t('active')}
                          </div>
                        ) : (
                          <ArrowRight size={16} className="text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-start justify-between mt-0.5">
                      <p className="text-xs text-gray-600 dark:text-gray-300 flex-1">
                        {preset.isCopy && preset.descriptionKey ? t(preset.descriptionKey) : preset.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0 self-end">
                        <Circle size={12} />
                        <span>{preset.stations.length} {t('stations')}</span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </>
        )}
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1 pt-2">
          {t('presets')}
        </div>
        {trainPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onLoadPreset(preset)}
            className={`w-full text-left p-3 rounded-lg transition-all hover:border-blue-400 hover:shadow-md ${
              currentPresetId === preset.id ? 'btn-selected' : 'btn-unselected'
            }`}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                  {t(preset.name)}
                </h3>
                {currentPresetId === preset.id ? (
                  <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded flex-shrink-0">
                    {t('active')}
                  </div>
                ) : (
                  <ArrowRight size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-start justify-between mt-0.5">
                <p className="text-xs text-gray-600 dark:text-gray-300 flex-1">
                  {t(preset.description)}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0 self-end">
                  <Circle size={12} />
                  <span>{preset.stations.length} {t('stations')}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
        {currentPreset && currentPreset.fullDescription ? (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {currentPreset.isCopy && currentPreset.fullDescriptionKey ? t(currentPreset.fullDescriptionKey) : t(currentPreset.fullDescription)}
          </p>
        ) : (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            💡 {t('clickPresetToLoad')}
          </p>
        )}
      </div>
    </div>
  )
}

export default PresetSidebar
