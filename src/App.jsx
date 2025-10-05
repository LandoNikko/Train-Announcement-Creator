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
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey)
  const [currentPresetId, setCurrentPresetId] = useState(null)

  useEffect(() => {
    const defaultPreset = trainPresets.find(p => p.id === 'simple')
    if (defaultPreset && stations.length === 0) {
      loadPreset(defaultPreset)
    }
  }, [])

  const handleApiKeySave = (key) => {
    sessionStorage.setItem('elevenLabsApiKey', key)
    setApiKey(key)
    setShowApiKeyInput(false)
  }

  const loadPreset = (preset) => {
    setStations(preset.stations)
    setLines(preset.lines)
    setCurrentPresetId(preset.id)
    setSelectedStations([])
    setAnnouncements([])
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Toolbar 
        currentTool={currentTool}
        onToolChange={setCurrentTool}
        onShowApiKey={() => setShowApiKeyInput(true)}
        hasApiKey={!!apiKey}
      />
      
      {showApiKeyInput && (
        <APIKeyInput 
          onSave={handleApiKeySave}
          onClose={() => setShowApiKeyInput(false)}
          initialKey={apiKey}
        />
      )}
      
      <div className="flex flex-1 overflow-hidden">
        <PresetSidebar 
          onLoadPreset={loadPreset}
          currentPresetId={currentPresetId}
        />
        
        <div className="flex-1 border-r border-gray-200">
          <MapEditor
            stations={stations}
            setStations={setStations}
            lines={lines}
            setLines={setLines}
            currentTool={currentTool}
            selectedStations={selectedStations}
            setSelectedStations={setSelectedStations}
          />
        </div>
        
        <div className="w-96 flex flex-col">
          <AnnouncementPanel
            stations={stations}
            lines={lines}
            announcements={announcements}
            setAnnouncements={setAnnouncements}
            apiKey={apiKey}
          />
        </div>
      </div>
    </div>
  )
}

export default App
