import { useState, useRef, useEffect } from 'react'
import { Play, Pause, X, ChevronDown, ChevronUp, Volume2, VolumeX, SkipBack, SkipForward, List, GitCommitVertical, Building2, TrainFront, ArrowDown, AlertTriangle, Plus, RotateCcw } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { getAllPresets } from '../../data/audioPresets'
//- remove the 'remove' button from in-betweens and add it to the dashed line aligning with the corresponding button. its icon can be square-minus
const AnnouncementPanel = ({ 
  stations, 
  lines, 
  announcements, 
  setAnnouncements, 
  apiKey, 
  language = 'en', 
  isMobile, 
  onClose,
  onStationSelect,
  selectedStationId 
}) => {
  const { t } = useTranslation(language)
  const [selectedLineId, setSelectedLineId] = useState(null)
  const [audioAssignments, setAudioAssignments] = useState({})
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null)
  const [isPlayingAll, setIsPlayingAll] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState({})
  const [showAIConfig, setShowAIConfig] = useState(null)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [masterVolume, setMasterVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [currentStationIndex, setCurrentStationIndex] = useState(0)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const [showSpeedControl, setShowSpeedControl] = useState(false)
  const [uploadedAudios, setUploadedAudios] = useState([])
  const [announcementTypes, setAnnouncementTypes] = useState({})
  const [betweenSegments, setBetweenSegments] = useState({})
  const [hoveredBetweenSlot, setHoveredBetweenSlot] = useState(null)
  const fileInputRefs = useRef({})
  const audioRef = useRef(null)
  const dropdownRefs = useRef({})

  // Auto-select first line when lines change
  useEffect(() => {
    if (lines.length > 0 && !selectedLineId) {
      setSelectedLineId(lines[0].id)
    }
  }, [lines, selectedLineId])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutside = Object.keys(openDropdowns).every(slotId => {
        const ref = dropdownRefs.current[slotId]
        return !ref || !ref.contains(event.target)
      })
      if (clickedOutside) {
        setOpenDropdowns({})
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdowns])

  const selectedLine = lines.find(line => line.id === selectedLineId)
  const lineStations = selectedLine 
    ? selectedLine.stations
        .map(stationId => stations.find(s => s.id === stationId))
        .filter(Boolean)
        .filter((station, index, arr) => {
          // Remove duplicate last station if it's the same as the first
          if (index === arr.length - 1 && arr.length > 1) {
            return station.id !== arr[0].id
          }
          return true
        })
    : []

  // Auto-populate presets for all stations when line changes
  useEffect(() => {
    if (lineStations.length > 0 && selectedLineId) {
      const newAssignments = {}
      const presets = getAllPresets()
      
      // Get station IDs for the current line
      const currentLineStationIds = new Set(lineStations.map(s => s.id))
      
      // Filter out assignments from other lines
      const filteredAssignments = {}
      Object.keys(audioAssignments).forEach(slotId => {
        if (slotId.startsWith('station-')) {
          const stationId = parseInt(slotId.replace('station-', ''))
          if (currentLineStationIds.has(stationId)) {
            filteredAssignments[slotId] = audioAssignments[slotId]
          }
        } else if (slotId.startsWith('between-')) {
          const [_, id1, id2] = slotId.match(/between-(\d+)-(\d+)/) || []
          if (id1 && id2 && currentLineStationIds.has(parseInt(id1)) && currentLineStationIds.has(parseInt(id2))) {
            filteredAssignments[slotId] = audioAssignments[slotId]
          }
        }
      })
      
      lineStations.forEach((station, index) => {
        const slotIndex = index * 2
        const stationSlotId = `station-${station.id}`
        
        if (!filteredAssignments[stationSlotId]) {
          const preset = presets[slotIndex % presets.length]
          newAssignments[stationSlotId] = {
            type: 'preset',
            url: preset.path,
            name: preset.name
          }
        } else {
          newAssignments[stationSlotId] = filteredAssignments[stationSlotId]
        }
        
        if (index < lineStations.length - 1) {
          const betweenSlotId = `between-${station.id}-${lineStations[index + 1].id}`
          if (!filteredAssignments[betweenSlotId]) {
            const preset = presets[(slotIndex + 1) % presets.length]
            newAssignments[betweenSlotId] = {
              type: 'preset',
              url: preset.path,
              name: preset.name
            }
          } else {
            newAssignments[betweenSlotId] = filteredAssignments[betweenSlotId]
          }
        }
      })
      
      setAudioAssignments(newAssignments)
    }
  }, [selectedLineId, lineStations.length])

  const getAnnouncementIcon = (slotId, type = 'station') => {
    const customType = announcementTypes[slotId] || type
    
    switch(customType) {
      case 'central':
        return <Building2 size={14} className="text-purple-500" />
      case 'station':
        return <GitCommitVertical size={14} className="text-blue-500" />
      case 'approach':
        return <ArrowDown size={14} className="text-green-500" />
      case 'departure':
        return <TrainFront size={14} className="text-orange-500" />
      case 'warning':
        return <AlertTriangle size={14} className="text-red-500" />
      case 'general':
      default:
        return <GitCommitVertical size={14} className="text-gray-400" />
    }
  }

  const handleStationClick = (stationId) => {
    if (onStationSelect) {
      onStationSelect(stationId)
    }
  }

  const handleTypeChange = (slotId, newType) => {
    setAnnouncementTypes(prev => ({
      ...prev,
      [slotId]: newType
    }))
  }

  const addBetweenSegment = (afterSlotId) => {
    const segmentId = `${afterSlotId}-segment-${Date.now()}`
    setBetweenSegments(prev => ({
      ...prev,
      [afterSlotId]: [...(prev[afterSlotId] || []), segmentId]
    }))
  }

  const removeBetweenSegment = (parentSlotId, segmentId) => {
    setBetweenSegments(prev => ({
      ...prev,
      [parentSlotId]: (prev[parentSlotId] || []).filter(id => id !== segmentId)
    }))
    
    // Also remove the audio assignment
    setAudioAssignments(prev => {
      const newAssignments = { ...prev }
      delete newAssignments[segmentId]
      return newAssignments
    })
  }

  const removeMainBetweenSlot = (slotId) => {
    setAudioAssignments(prev => {
      const newAssignments = { ...prev }
      if (newAssignments[slotId]?.url && newAssignments[slotId]?.type === 'upload') {
        URL.revokeObjectURL(newAssignments[slotId].url)
      }
      delete newAssignments[slotId]
      return newAssignments
    })
  }

  const handleFileUpload = (slotId, event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file)
      const uploadedAudio = {
        id: `upload-${Date.now()}`,
        name: file.name,
        url
      }
      
      setUploadedAudios(prev => [...prev, uploadedAudio])
      setAudioAssignments(prev => ({
        ...prev,
        [slotId]: {
          type: 'upload',
          url,
          name: file.name
        }
      }))
      setOpenDropdowns({})
    }
  }

  const handleGenerateAudio = async (slotId, stationName) => {
    if (!apiKey) return
    
    // Placeholder for ElevenLabs API integration
    console.log('Generate audio for:', stationName)
    // TODO: Implement actual API call
  }

  const handleSelectPreset = (slotId, preset) => {
    setAudioAssignments(prev => ({
      ...prev,
      [slotId]: {
        type: 'preset',
        url: preset.path,
        name: preset.name
      }
    }))
    setOpenDropdowns({})
  }

  const toggleDropdown = (slotId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [slotId]: !prev[slotId]
    }))
    setShowAIConfig(null)
  }

  const handleShowAIConfig = (slotId) => {
    setShowAIConfig(slotId)
    setOpenDropdowns({})
  }

  const handleRemoveAudio = (slotId) => {
    setAudioAssignments(prev => {
      const newAssignments = { ...prev }
      if (newAssignments[slotId]?.url && newAssignments[slotId]?.type === 'upload') {
        URL.revokeObjectURL(newAssignments[slotId].url)
      }
      delete newAssignments[slotId]
      return newAssignments
    })
  }

  const handlePlayAudio = (slotId) => {
    const assignment = audioAssignments[slotId]
    if (!assignment?.url) return

    if (currentlyPlaying === slotId) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setCurrentlyPlaying(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setCurrentlyPlaying(slotId)
      const audio = new Audio(assignment.url)
      audioRef.current = audio
      audio.playbackRate = playbackSpeed
      audio.volume = isMuted ? 0 : masterVolume
      audio.onended = () => {
        setCurrentlyPlaying(null)
        audioRef.current = null
      }
      audio.onerror = (e) => {
        console.error('Audio playback error:', e)
        setCurrentlyPlaying(null)
        audioRef.current = null
      }
      audio.play().catch(err => {
        console.error('Failed to play audio:', err)
        setCurrentlyPlaying(null)
        audioRef.current = null
      })
    }
  }

  const handleSpeedChange = (newSpeed) => {
    setPlaybackSpeed(newSpeed)
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed
    }
  }

  const getSpeedStep = (speed) => {
    if (speed >= 1 && speed <= 2) {
      return 0.1
    }
    return 0.25
  }

  const handlePrevStation = () => {
    if (lineStations.length === 0) return
    const newIndex = currentStationIndex > 0 ? currentStationIndex - 1 : lineStations.length - 1
    setCurrentStationIndex(newIndex)
    const station = lineStations[newIndex]
    const slotId = `station-${station.id}`
    handlePlayAudio(slotId)
  }

  const handleNextStation = () => {
    if (lineStations.length === 0) return
    const newIndex = (currentStationIndex + 1) % lineStations.length
    setCurrentStationIndex(newIndex)
    const station = lineStations[newIndex]
    const slotId = `station-${station.id}`
    handlePlayAudio(slotId)
  }

  const handlePlayCurrent = () => {
    if (lineStations.length === 0) return
    const station = lineStations[currentStationIndex]
    const slotId = `station-${station.id}`
    handlePlayAudio(slotId)
  }

  const handlePlayAll = () => {
    if (isPlayingAll) {
      setIsPlayingAll(false)
      setCurrentlyPlaying(null)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    } else {
      setIsPlayingAll(true)
      setCurrentStationIndex(0)
      playSequence()
    }
  }

  const playSequence = async () => {
    const slots = []
    lineStations.forEach((station, index) => {
      slots.push(`station-${station.id}`)
      if (index < lineStations.length - 1) {
        slots.push(`between-${station.id}-${lineStations[index + 1].id}`)
      }
    })

    for (let i = 0; i < slots.length; i++) {
      if (!isPlayingAll) break
      const slotId = slots[i]
      const assignment = audioAssignments[slotId]
      if (assignment?.url) {
        await new Promise((resolve) => {
          setCurrentlyPlaying(slotId)
          const audio = new Audio(assignment.url)
          audioRef.current = audio
          audio.playbackRate = playbackSpeed
          audio.volume = masterVolume
          audio.onended = () => {
            setCurrentlyPlaying(null)
            audioRef.current = null
            resolve()
          }
          audio.play()
        })
      }
      
      if (slotId.startsWith('station-')) {
        const stationIndex = lineStations.findIndex(s => `station-${s.id}` === slotId)
        if (stationIndex !== -1) {
          setCurrentStationIndex(stationIndex)
        }
      }
    }
    setIsPlayingAll(false)
  }

  const renderAudioSlot = (slotId, label, stationId = null, slotIndex = 0, isExtraSegment = false, parentSlotId = null) => {
    const assignment = audioAssignments[slotId]
    const isSelected = stationId && stationId === selectedStationId
    const isPlaying = currentlyPlaying === slotId
    const isDropdownOpen = openDropdowns[slotId]
    const isAIConfigOpen = showAIConfig === slotId
    const isTypeDropdownOpen = openDropdowns[`${slotId}-type`]
    const presets = getAllPresets()
    const slotType = slotId.startsWith('between') || isExtraSegment ? 'general' : 'station'
    const isStation = !slotId.startsWith('between') && !isExtraSegment

  return (
      <div 
        className={`border border-gray-200 dark:border-gray-700 rounded-lg transition-all overflow-visible ${
          isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''
        }`}
      >
        <div 
          className={`p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg ${
            isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
          }`}
          onClick={() => {
            if (stationId) handleStationClick(stationId)
          }}
        >
          <div className="flex items-center gap-2">
            {/* Only show icon selector for in-between slots */}
            {!isStation && (
              <div className="relative flex-shrink-0" ref={el => dropdownRefs.current[`${slotId}-type`] = el}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleDropdown(`${slotId}-type`)
                  }}
                  className="flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded p-0.5 transition-colors"
                >
                  {getAnnouncementIcon(slotId, slotType)}
                </button>
                
                {isTypeDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1 min-w-[140px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTypeChange(slotId, 'general')
                        setOpenDropdowns({})
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm"
                    >
                      <GitCommitVertical size={14} className="text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">General</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTypeChange(slotId, 'approach')
                        setOpenDropdowns({})
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm"
                    >
                      <ArrowDown size={14} className="text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">Approach</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTypeChange(slotId, 'departure')
                        setOpenDropdowns({})
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm"
                    >
                      <TrainFront size={14} className="text-orange-500" />
                      <span className="text-gray-700 dark:text-gray-300">Departure</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTypeChange(slotId, 'warning')
                        setOpenDropdowns({})
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm"
                    >
                      <AlertTriangle size={14} className="text-red-500" />
                      <span className="text-gray-700 dark:text-gray-300">Warning</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <span className="font-medium text-sm text-gray-800 dark:text-gray-200 flex-shrink-0">{label}</span>
            
            {/* Remove button for extra segments or main between slots */}
            {((isExtraSegment && parentSlotId) || (!isStation && !isExtraSegment && assignment)) && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (isExtraSegment && parentSlotId) {
                    removeBetweenSegment(parentSlotId, slotId)
                  } else {
                    removeMainBetweenSlot(slotId)
                  }
                }}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                title="Remove segment"
              >
                <X size={12} className="text-red-500" />
              </button>
            )}
            
            <div className="flex-1 relative" ref={el => dropdownRefs.current[slotId] = el}>
              <input
                ref={el => fileInputRefs.current[slotId] = el}
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileUpload(slotId, e)}
                className="hidden"
              />
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleDropdown(slotId)
                }}
                className="w-full flex items-center justify-between gap-2 px-2 py-1.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded border border-gray-200 dark:border-gray-600 transition-colors text-xs"
              >
                <span className="truncate text-gray-700 dark:text-gray-300">
                  {assignment ? assignment.name : 'Select audio...'}
                </span>
                {isDropdownOpen ? (
                  <ChevronUp size={14} className="flex-shrink-0 text-gray-500" />
                ) : (
                  <ChevronDown size={14} className="flex-shrink-0 text-gray-500" />
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRefs.current[slotId]?.click()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"
                  >
                    <span className="text-blue-600 dark:text-blue-400">+</span>
                    <span>Upload Audio</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShowAIConfig(slotId)
                    }}
                    disabled={!apiKey}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-blue-600 dark:text-blue-400">+</span>
                    <span>Generate with AI</span>
                  </button>

                  <div className="py-1">
                    {uploadedAudios.map((uploaded) => (
                      <button
                        key={uploaded.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectPreset(slotId, { path: uploaded.url, name: uploaded.name })
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="truncate">{uploaded.name}</span>
                      </button>
                    ))}
                    {presets.map((preset) => (
        <button
                        key={preset.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectPreset(slotId, preset)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="truncate">{preset.name}</span>
        </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {assignment && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePlayAudio(slotId)
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors flex-shrink-0"
                title={t('playAudio')}
              >
                {isPlaying ? (
                  <Pause size={14} className="text-blue-500" />
                ) : (
                  <Play size={14} className="text-gray-600 dark:text-gray-400" />
                )}
              </button>
        )}
      </div>

          {isAIConfigOpen && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">AI Generation Options</p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleGenerateAudio(slotId, label)
                    setShowAIConfig(null)
                  }}
                  className="flex-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
                >
                  Generate
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAIConfig(null)
                  }}
                  className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t('audioQueue')}</h2>
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          )}
          </div>

        {lines.length > 1 && (
          <select
            value={selectedLineId || ''}
            onChange={(e) => setSelectedLineId(e.target.value)}
            className="w-full px-3 py-2 mb-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200"
          >
            {lines.map(line => (
              <option key={line.id} value={line.id}>
                {line.name} ({line.stations.length} {t('stations')})
              </option>
            ))}
          </select>
        )}

        {lineStations.length > 0 && (
          <>
            {/* Master Control Panel */}
            <div className="flex items-center gap-1 mb-1.5">
              <button
                onClick={() => setShowVolumeControl(!showVolumeControl)}
                className="flex items-center justify-center gap-0.5 p-1.5 rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                title={t('toggleVolume')}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                {showVolumeControl ? (
                  <ChevronUp size={12} className="opacity-60" />
                ) : (
                  <ChevronDown size={12} className="opacity-60" />
                )}
              </button>
              
              <button
                onClick={handlePrevStation}
                className="flex items-center justify-center p-1.5 rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                title={t('previousStation')}
              >
                <SkipBack size={16} />
              </button>
              
              <button
                onClick={handlePlayCurrent}
                className="flex items-center justify-center p-1.5 rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                title={t('playPause')}
              >
                {currentlyPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              
              <button
                onClick={handleNextStation}
                className="flex items-center justify-center p-1.5 rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                title={t('nextStation')}
              >
                <SkipForward size={16} />
              </button>
              
              <button
                onClick={handlePlayAll}
                className="flex items-center justify-center p-1.5 rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                title={t('playAllSequence')}
              >
                {isPlayingAll ? <Pause size={16} /> : <List size={16} />}
              </button>
              
              <button
                onClick={() => setShowSpeedControl(!showSpeedControl)}
                className="flex items-center justify-center gap-0.5 p-1.5 rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 min-w-[44px]"
                title={t('cycleSpeed')}
              >
                <span className="text-xs font-medium leading-none">{playbackSpeed}x</span>
                {showSpeedControl ? (
                  <ChevronUp size={12} className="opacity-60" />
                ) : (
                  <ChevronDown size={12} className="opacity-60" />
                )}
              </button>
            </div>

            {/* Volume Control Row */}
            {showVolumeControl && (
              <div className="flex items-center gap-2 mb-1.5 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setIsMuted(!isMuted)
                    if (audioRef.current) {
                      audioRef.current.volume = isMuted ? masterVolume : 0
                    }
                  }}
                  className="flex items-center justify-center p-1.5 rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  title={isMuted ? t('unmute') : t('mute')}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : masterVolume}
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value)
                      setMasterVolume(newVolume)
                      if (newVolume > 0) setIsMuted(false)
                      if (audioRef.current) {
                        audioRef.current.volume = newVolume
                      }
                    }}
                    className="flex-1 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[32px] text-right">
                    {Math.round((isMuted ? 0 : masterVolume) * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* Speed Control Row */}
            {showSpeedControl && (
              <div className="flex items-center gap-2 mb-1.5 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <button
                  onClick={() => handleSpeedChange(1)}
                  className="flex items-center justify-center p-1.5 rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Reset to 1x"
                >
                  <span className="text-xs font-medium">1x</span>
        </button>
                
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[32px]">
                    0.5x
                  </span>
                  <input
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.05"
                    value={playbackSpeed}
                    onChange={(e) => {
                      const newSpeed = parseFloat(e.target.value)
                      handleSpeedChange(newSpeed)
                    }}
                    className="flex-1 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[32px]">
                    4x
                  </span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[36px] text-right">
                    {playbackSpeed.toFixed(2)}x
                  </span>
                </div>
              </div>
            )}

            {/* Current Station Indicator */}
            <div className="text-xs text-gray-600 dark:text-gray-400 text-center mb-1.5">
              {t('stationOf').replace('{current}', currentStationIndex + 1).replace('{total}', lineStations.length)}
              {lineStations[currentStationIndex] && (
                <span className="font-medium text-gray-700 dark:text-gray-300"> • {lineStations[currentStationIndex].name}</span>
              )}
            </div>
          </>
        )}

        {!apiKey && lines.length > 0 && (
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1.5">{t('setApiKeyToGenerate')}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {lines.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 mt-6">
            <p>{t('noLinesYet')}</p>
            <p className="text-sm mt-1.5">{t('createLineFirst')}</p>
          </div>
        ) : lineStations.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 mt-6">
            <p>{t('selectLine')}</p>
          </div>
        ) : (
          <div className="flex gap-2">
            {/* Timeline visualization column */}
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: '20px' }}>
              {lineStations.map((station, index) => {
                const stationSlotId = `station-${station.id}`
                const betweenSlotId = `between-${station.id}-${lineStations[index + 1]?.id}`
                const isLastStation = index === lineStations.length - 1
                
                // Calculate line height based on between-station content
                const hasMainBetween = audioAssignments[betweenSlotId]
                const extraSegmentCount = (betweenSegments[betweenSlotId] || []).length
                const betweenItemCount = (hasMainBetween ? 1 : 0) + extraSegmentCount
                const lineHeight = betweenItemCount > 0 ? (betweenItemCount * 50 + 28) : 76
                
                return (
                  <div key={`timeline-${station.id}`} className="flex flex-col items-center w-full">
                    {/* Station circle - aligned with station slot */}
                    <div className="flex items-center justify-center" style={{ height: '44px' }}>
                      <div className="w-3 h-3 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500" />
                    </div>
                    
                    {/* Connecting line to next station (skip for last station) */}
                    {!isLastStation && (
                      <div className="w-0.5 bg-gray-300 dark:bg-gray-600" style={{ height: `${lineHeight}px` }} />
                    )}
                  </div>
                )
              })}
              
              {/* Loop indicator - separate from stations */}
              {lineStations.length > 1 && (
                <>
                  <div className="w-0.5 bg-gray-300 dark:bg-gray-600" style={{ height: '30px' }} />
                  <div className="w-3 h-3 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 opacity-50" />
                </>
        )}
      </div>

            {/* Audio slots column */}
            <div className="flex-1 min-w-0 space-y-1.5 overflow-visible">
              {lineStations.map((station, index) => {
                let slotIndex = index * 2
                const stationSlotId = `station-${station.id}`
                const betweenSlotId = `between-${station.id}-${lineStations[index + 1]?.id}`
                const isLastStation = index === lineStations.length - 1
                
                return (
                  <div key={`slot-group-${station.id}`}>
                    {renderAudioSlot(
                      stationSlotId,
                      `${index + 1}. ${station.name}`,
                      station.id,
                      slotIndex
                    )}
                    
                    {index < lineStations.length - 1 && (
                      <div 
                        className="relative my-3 pl-8 pr-0"
                        onMouseEnter={() => setHoveredBetweenSlot(betweenSlotId)}
                        onMouseLeave={() => setHoveredBetweenSlot(null)}
                      >
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-gray-300 dark:border-gray-600" />
                        
                        {/* Add segment buttons on the dashed line */}
                        {hoveredBetweenSlot === betweenSlotId && (
                          <>
                            <button
                              onClick={() => addBetweenSegment(betweenSlotId)}
                              className="absolute left-3 -translate-x-1/2 top-0 -translate-y-1/2 p-0.5 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors shadow-sm border border-gray-300 dark:border-gray-600 z-10"
                              title="Add segment"
                            >
                              <Plus size={12} className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400" />
                            </button>
                            
                            {(betweenSegments[betweenSlotId] || []).map((_, segIndex) => (
                              <button
                                key={`add-${segIndex}`}
                                onClick={() => addBetweenSegment(betweenSlotId)}
                                className="absolute left-3 -translate-x-1/2 p-0.5 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors shadow-sm border border-gray-300 dark:border-gray-600 z-10"
                                style={{ top: `${((segIndex + 1) / ((betweenSegments[betweenSlotId]?.length || 0) + 2)) * 100}%` }}
                                title="Add segment"
                              >
                                <Plus size={12} className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400" />
                              </button>
                            ))}
                            
                            <button
                              onClick={() => addBetweenSegment(betweenSlotId)}
                              className="absolute left-3 -translate-x-1/2 bottom-0 translate-y-1/2 p-0.5 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors shadow-sm border border-gray-300 dark:border-gray-600 z-10"
                              title="Add segment"
                            >
                              <Plus size={12} className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400" />
                            </button>
                          </>
                        )}
                        
                        <div className="space-y-1.5">
                          {renderAudioSlot(
                            betweenSlotId,
                            `↓`,
                            null,
                            slotIndex + 1
                          )}
                          
                          {/* Extra between segments */}
                          {(betweenSegments[betweenSlotId] || []).map((segmentId) => (
                            <div key={segmentId}>
                              {renderAudioSlot(
                                segmentId,
                                `↓`,
                                null,
                                slotIndex + 1,
                                true,
                                betweenSlotId
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Loop indicator for last station */}
                    {isLastStation && lineStations.length > 1 && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mt-3">
                        <RotateCcw size={12} className="flex-shrink-0" />
                        <span>Returns to {lineStations[0].name}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnnouncementPanel

