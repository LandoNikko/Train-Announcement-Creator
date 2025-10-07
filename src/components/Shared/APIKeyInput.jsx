import { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

const APIKeyInput = ({ onSave, onClose, initialKey, language = 'en' }) => {
  const { t } = useTranslation(language)
  const [key, setKey] = useState(initialKey)
  const [showKey, setShowKey] = useState(false)

  const handleSave = () => {
    if (key.trim()) {
      onSave(key.trim())
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t('elevenLabsApiKey')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {t('apiKeyDescription')}
        </p>

        <div className="mb-4">
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={t('apiKeyPlaceholder')}
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {t('saveKey')}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            {t('cancel')}
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          {t('getApiKeyFrom')} <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">elevenlabs.io</a>
        </p>
      </div>
    </div>
  )
}

export default APIKeyInput
