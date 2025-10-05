import { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'

const APIKeyInput = ({ onSave, onClose, initialKey }) => {
  const [key, setKey] = useState(initialKey)
  const [showKey, setShowKey] = useState(false)

  const handleSave = () => {
    if (key.trim()) {
      onSave(key.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">ElevenLabs API Key</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Enter your ElevenLabs API key. It will be stored in your browser session only and cleared when you close the browser.
        </p>

        <div className="mb-4">
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk_..."
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Save Key
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Get your API key from <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">elevenlabs.io</a>
        </p>
      </div>
    </div>
  )
}

export default APIKeyInput
