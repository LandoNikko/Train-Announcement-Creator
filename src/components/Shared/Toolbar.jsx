import { Pointer, MapPin, Minus, Key, Info } from 'lucide-react'

const Toolbar = ({ currentTool, onToolChange, onShowApiKey, hasApiKey }) => {
  const tools = [
    { id: 'select', icon: Pointer, label: 'Select' },
    { id: 'station', icon: MapPin, label: 'Add Station' },
    { id: 'line', icon: Minus, label: 'Draw Line' },
  ]

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">Train Announcement Creator</h1>
        
        <div className="flex gap-2 ml-8">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentTool === tool.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <tool.icon size={18} />
              <span className="text-sm font-medium">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onShowApiKey}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          hasApiKey
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
        }`}
      >
        <Key size={18} />
        <span className="text-sm font-medium">
          {hasApiKey ? 'API Key Set' : 'Set API Key'}
        </span>
      </button>
    </div>
  )
}

export default Toolbar
