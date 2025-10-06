import { Pointer, MapPin, Minus, Key, Info, RotateCcw, ZoomIn, ZoomOut, Globe, Undo2, Redo2, ChevronUp } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { languages } from '../../locales/translations'

const Toolbar = ({ currentTool, onToolChange, onShowApiKey, hasApiKey, isDarkMode, onToggleDarkMode, gridZoom, onGridZoomChange, onReset, language, onLanguageChange, lineStyle, onLineStyleChange, onUndo, onRedo, canUndo, canRedo, isMobile, showMobileHeader, onToggleMobileHeader }) => {
  const { t } = useTranslation(language)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const languageMenuRef = useRef(null)
  const tools = [
    { id: 'select', icon: Pointer, label: t('selectTool') },
    { id: 'station', icon: MapPin, label: t('addStationTool') },
    { id: 'line', icon: Minus, label: t('drawLineTool') },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 md:px-4 py-2 md:py-3 transition-colors">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('appTitle')}</h1>
          
          <div className="flex gap-2">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentTool === tool.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <tool.icon size={18} />
                <span className="text-sm font-medium">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">{t('lineStyle')}:</span>
          <div className="flex gap-1">
            <button
              onClick={() => onLineStyleChange('direct')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                lineStyle === 'direct'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
              title={t('lineStyleDirect')}
            >
              ─
            </button>
            <button
              onClick={() => onLineStyleChange('minimal')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                lineStyle === 'minimal'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
              title={t('lineStyleMinimal')}
            >
              <i className="ri-loader-5-fill"></i>
            </button>
            <button
              onClick={() => onLineStyleChange('smooth')}
              className={`flex items-center justify-center px-2 py-1 text-base rounded transition-colors ${
                lineStyle === 'smooth'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
              title={t('lineStyleSmooth')}
            >
              ∿
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <ZoomOut size={16} className="text-gray-600 dark:text-gray-400" />
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={gridZoom}
            onChange={(e) => onGridZoomChange(parseFloat(e.target.value))}
            className="w-24 h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            title={`${t('zoom')}: ${Math.round(gridZoom * 100)}%`}
          />
          <ZoomIn size={16} className="text-gray-600 dark:text-gray-400" />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={t('undo')}
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={t('redo')}
          >
            <Redo2 size={18} />
          </button>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title={t('resetToDefault')}
        >
          <RotateCcw size={18} />
        </button>

        <div 
          className="relative" 
          ref={languageMenuRef}
          onMouseEnter={() => setShowLanguageMenu(true)}
          onMouseLeave={() => setShowLanguageMenu(false)}
        >
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Language"
          >
            <Globe size={18} />
            <span className="text-lg">{languages.find(l => l.code === language)?.flag}</span>
          </button>
          
           {showLanguageMenu && (
             <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-[100]">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    language === lang.code ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onToggleDarkMode}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title={isDarkMode ? t('switchToLightMode') : t('switchToDarkMode')}
        >
          <i className={`${isDarkMode ? 'ri-sun-fill' : 'ri-moon-fill'} text-lg`}></i>
        </button>
        
        <button
          onClick={onShowApiKey}
          className={`flex items-center gap-2 px-2 md:px-4 py-2 rounded-lg transition-colors ${
            hasApiKey
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
              : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800'
          }`}
        >
          <Key size={18} />
          <span className="text-sm font-medium">
            {hasApiKey ? t('apiKeySet') : t('setApiKey')}
          </span>
        </button>
      </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                currentTool === tool.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              title={tool.label}
            >
              <tool.icon size={18} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-40"
            title={t('undo')}
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-40"
            title={t('redo')}
          >
            <Redo2 size={16} />
          </button>
          
          <button
            onClick={onToggleDarkMode}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <i className={`${isDarkMode ? 'ri-sun-fill' : 'ri-moon-fill'}`}></i>
          </button>
          
          <button
            onClick={onShowApiKey}
            className={`flex items-center justify-center w-9 h-9 rounded-lg ${
              hasApiKey ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}
          >
            <Key size={16} />
          </button>
          
          <button
            onClick={onToggleMobileHeader}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <ChevronUp size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toolbar
