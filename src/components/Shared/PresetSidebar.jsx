import { Map, Circle, ArrowRight } from 'lucide-react'
import { trainPresets } from '../../data/presets'

const PresetSidebar = ({ onLoadPreset, currentPresetId }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Map size={20} />
          Train Line Presets
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Load a preset to get started
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {trainPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onLoadPreset(preset)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:border-blue-400 hover:shadow-md ${
              currentPresetId === preset.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-sm">
                  {preset.name}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {preset.description}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <Circle size={12} />
                  <span>{preset.stations.length} stations</span>
                </div>
              </div>
              {currentPresetId === preset.id ? (
                <div className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                  Active
                </div>
              ) : (
                <ArrowRight size={16} className="ml-2 text-gray-400 flex-shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600">
          💡 Click any preset to load it onto the map
        </p>
      </div>
    </div>
  )
}

export default PresetSidebar
