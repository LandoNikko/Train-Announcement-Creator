import { useState, useEffect } from 'react'
import MapEditor from './components/MapEditor/MapEditor'
import AnnouncementPanel from './components/AnnouncementEditor/AnnouncementPanel'
import Toolbar from './components/Shared/Toolbar'
import APIKeyInput from './components/Shared/APIKeyInput'
import PresetSidebar from './components/Shared/PresetSidebar'
import { trainPresets } from './data/presets'

function App() {
  const [stations, setStations] = useState([])
  const [lines, setLines] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [currentTool, setCurrentTool] = useState('select')
  const [selectedStations, setSelectedStations] = useState([])
  const [apiKey, setApiKey] = useState(sessionStorage.getItem('elevenLabsApiKey') || '')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [currentPresetId, setCurrentPresetId] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved === 'true'
  })
  const [gridZoom, setGridZoom] = useState(1)
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en'
  })
  const [isMobile, setIsMobile] = useState(false)
  const [showMobilePresets, setShowMobilePresets] = useState(false)
  const [showMobileAnnouncements, setShowMobileAnnouncements] = useState(false)
  const [showMobileHeader, setShowMobileHeader] = useState(true)
  const [lineStyle, setLineStyle] = useState(() => {
    return localStorage.getItem('lineStyle') || 'smooth'
  })
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showStationNumbers, setShowStationNumbers] = useState(false)
  const [selectedStationId, setSelectedStationId] = useState(null)

  useEffect(() => {
    const defaultPreset = trainPresets.find(p => p.id === 'simple')
    if (defaultPreset && stations.length === 0) {
      loadPreset(defaultPreset)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString())
    
    const htmlElement = document.documentElement
    const bodyElement = document.body
    
    htmlElement.classList.remove('dark')
    if (bodyElement) bodyElement.classList.remove('dark')
    
    if (isDarkMode) {
      htmlElement.classList.add('dark')
      if (bodyElement) bodyElement.classList.add('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  useEffect(() => {
    localStorage.setItem('lineStyle', lineStyle)
  }, [lineStyle])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])


  const handleApiKeySave = (key) => {
    sessionStorage.setItem('elevenLabsApiKey', key)
    setApiKey(key)
    setShowApiKeyInput(false)
  }

  const loadPreset = (preset) => {
    // Add grid indices to preset stations
    const baseSpacing = 30
    const stationsWithIndices = preset.stations.map(station => ({
      ...station,
      gridIndexX: station.gridIndexX ?? Math.round(station.x / baseSpacing),
      gridIndexY: station.gridIndexY ?? Math.round(station.y / baseSpacing)
    }))
    
    // Use base setters to avoid saving preset load to history
    setStations(stationsWithIndices)
    setLines(preset.lines)
    
    // Now save this as the initial history state
    setHistory([{
      stations: JSON.parse(JSON.stringify(stationsWithIndices)),
      lines: JSON.parse(JSON.stringify(preset.lines))
    }])
    setHistoryIndex(0)
    
    setCurrentPresetId(preset.id)
    setSelectedStations([])
    setAnnouncements([])
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Save state to history
  const saveToHistory = (newStations, newLines) => {
    const newState = {
      stations: JSON.parse(JSON.stringify(newStations)),
      lines: JSON.parse(JSON.stringify(newLines))
    }
    
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newState)
    
    // Keep only last 100 actions
    if (newHistory.length > 100) {
      newHistory.shift()
    } else {
      setHistoryIndex(historyIndex + 1)
    }
    
    setHistory(newHistory)
  }

  // Wrap setStations to save history
  const updateStations = (newStations) => {
    if (typeof newStations === 'function') {
      setStations(prev => {
        const updated = newStations(prev)
        saveToHistory(updated, lines)
        return updated
      })
    } else {
      saveToHistory(newStations, lines)
      setStations(newStations)
    }
  }

  // Wrap setLines to save history
  const updateLines = (newLines) => {
    if (typeof newLines === 'function') {
      setLines(prev => {
        const updated = newLines(prev)
        saveToHistory(stations, updated)
        return updated
      })
    } else {
      saveToHistory(stations, newLines)
      setLines(newLines)
    }
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setStations(history[newIndex].stations)
      setLines(history[newIndex].lines)
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setStations(history[newIndex].stations)
      setLines(history[newIndex].lines)
    }
  }

  const handleResetToDefault = () => {
    const defaultPreset = trainPresets.find(p => p.id === 'simple')
    if (defaultPreset) {
      loadPreset(defaultPreset)
      setGridZoom(1)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {(!isMobile || showMobileHeader) && (
        <Toolbar 
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          onShowApiKey={() => setShowApiKeyInput(true)}
          hasApiKey={!!apiKey}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          gridZoom={gridZoom}
          onGridZoomChange={setGridZoom}
          onReset={handleResetToDefault}
          language={language}
          onLanguageChange={setLanguage}
          lineStyle={lineStyle}
          onLineStyleChange={setLineStyle}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          isMobile={isMobile}
          showMobileHeader={showMobileHeader}
          onToggleMobileHeader={() => setShowMobileHeader(!showMobileHeader)}
          showStationNumbers={showStationNumbers}
          onToggleStationNumbers={() => setShowStationNumbers(!showStationNumbers)}
        />
      )}
      
      {showApiKeyInput && (
        <APIKeyInput 
          onSave={handleApiKeySave}
          onClose={() => setShowApiKeyInput(false)}
          initialKey={apiKey}
          language={language}
        />
      )}
      
      <div className="flex flex-1 overflow-hidden relative">
        {(!isMobile || showMobilePresets) && (
          <div className={`${isMobile ? 'absolute left-0 top-0 bottom-0 z-20 w-64 shadow-xl' : ''}`}>
            <PresetSidebar 
              onLoadPreset={loadPreset}
              currentPresetId={currentPresetId}
              language={language}
              isMobile={isMobile}
              onClose={() => setShowMobilePresets(false)}
            />
          </div>
        )}
        
        <div className="flex-1 border-r border-gray-200 dark:border-gray-700 relative">
          <MapEditor
            stations={stations}
            setStations={updateStations}
            setStationsNoHistory={setStations}
            lines={lines}
            setLines={updateLines}
            currentTool={currentTool}
            selectedStations={selectedStations}
            setSelectedStations={setSelectedStations}
            gridZoom={gridZoom}
            language={language}
            lineStyle={lineStyle}
            showStationNumbers={showStationNumbers}
            isMobile={isMobile}
            selectedStationId={selectedStationId}
          />
          
          {isMobile && (
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
              {!showMobileHeader && (
                <button
                  onClick={() => setShowMobileHeader(true)}
                  className="bg-blue-500 text-white p-3 rounded-lg shadow-lg"
                  title="Show Menu"
                >
                  ☰
                </button>
              )}
              <button
                onClick={() => setShowMobilePresets(!showMobilePresets)}
                className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
              >
                {showMobilePresets ? '✕' : '📋'}
              </button>
              <button
                onClick={() => setShowMobileAnnouncements(!showMobileAnnouncements)}
                className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
              >
                {showMobileAnnouncements ? '✕' : '🔊'}
              </button>
            </div>
          )}
        </div>
        
        {(!isMobile || showMobileAnnouncements) && (
          <div className={`${isMobile ? 'absolute right-0 top-0 bottom-0 z-20 w-80 shadow-xl' : 'w-96'} flex flex-col bg-white dark:bg-gray-800`}>
            <AnnouncementPanel
              stations={stations}
              lines={lines}
              announcements={announcements}
              setAnnouncements={setAnnouncements}
              apiKey={apiKey}
              language={language}
              isMobile={isMobile}
              onClose={() => setShowMobileAnnouncements(false)}
              onStationSelect={setSelectedStationId}
              selectedStationId={selectedStationId}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
