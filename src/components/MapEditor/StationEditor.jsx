import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'

const StationEditor = ({ station, onUpdate, onDelete, onClose }) => {
  const [name, setName] = useState(station.name)
  const [color, setColor] = useState(station.color)

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'
  ]

  const handleSave = () => {
    onUpdate({ ...station, name, color })
  }

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-4 w-64 z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">Edit Station</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">Color</label>
          <div className="flex gap-2">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-all ${
                  color === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => onDelete(station.id)}
            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default StationEditor
