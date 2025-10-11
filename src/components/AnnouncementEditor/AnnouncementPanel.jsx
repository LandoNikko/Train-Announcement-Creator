import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Play, Pause, Square, X, ChevronDown, ChevronUp, Volume2, VolumeX, SkipBack, SkipForward, List, GitCommitVertical, Building2, TrainFront, ArrowDown, AlertTriangle, Plus, RotateCcw, Music, Radio, Bell, Clock, MapPin, Info, MessageSquare, Trash2, FileText } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { getAllPresets } from '../../data/audioPresets'

// Animated sound wave indicator
const SoundWave = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
    <rect x="1" y="5" width="2" height="4" fill="currentColor" className="animate-sound-wave" style={{ animationDelay: '0ms' }} />
    <rect x="4" y="3" width="2" height="8" fill="currentColor" className="animate-sound-wave" style={{ animationDelay: '150ms' }} />
    <rect x="7" y="2" width="2" height="10" fill="currentColor" className="animate-sound-wave" style={{ animationDelay: '300ms' }} />
    <rect x="10" y="4" width="2" height="6" fill="currentColor" className="animate-sound-wave" style={{ animationDelay: '450ms' }} />
  </svg>
)

const AnnouncementPanel = ({ 
  stations, 
  lines, 
  announcements, 
  setAnnouncements, 
  audioAssignments,
  setAudioAssignments,
  announcementTypes,
  setAnnouncementTypes,
  betweenSegments,
  setBetweenSegments,
  uploadedAudios,
  setUploadedAudios,
  apiKey, 
  language = 'en', 
  isMobile, 
  onClose,
  onStationSelect,
  selectedStationId,
  showStationNumbers = false,
  onPlayingStationChange
}) => {
  const { t } = useTranslation(language)
  const [selectedLineId, setSelectedLineId] = useState(null)
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null)
  const [isPlayingAll, setIsPlayingAll] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState({})
  const [showAIConfig, setShowAIConfig] = useState(null)
  const [aiGenerationType, setAiGenerationType] = useState('text-to-speech')
  const [aiTextInput, setAiTextInput] = useState('')
  const [aiSelectedVoice, setAiSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM') // Default Rachel voice
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [masterVolume, setMasterVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [currentStationIndex, setCurrentStationIndex] = useState(0)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const [showSpeedControl, setShowSpeedControl] = useState(false)
  const [showTranscription, setShowTranscription] = useState(false)
  const [hoveredBetweenSlot, setHoveredBetweenSlot] = useState(null)
  const [audioDurations, setAudioDurations] = useState({})
  const [audioRemainingTimes, setAudioRemainingTimes] = useState({})
  const [queueProgress, setQueueProgress] = useState(0) // Overall queue progress in seconds
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0) // Current position in queue
  const fileInputRefs = useRef({})
  const audioRef = useRef(null)
  const dropdownRefs = useRef({})
  const updateIntervalRef = useRef(null)
  const queueUpdateIntervalRef = useRef(null)
  const isPlayingAllRef = useRef(false) // Ref to track queue playback state for async operations

  // Sync isPlayingAllRef with isPlayingAll state
  useEffect(() => {
    isPlayingAllRef.current = isPlayingAll
  }, [isPlayingAll])

  // Notify parent when playing station changes
  useEffect(() => {
    if (onPlayingStationChange && currentlyPlaying) {
      // Extract station ID from slot ID (format: "station-{stationId}")
      const match = currentlyPlaying.match(/^station-(.+)$/)
      if (match) {
        onPlayingStationChange(match[1], !isPaused)
      } else {
        onPlayingStationChange(null, false)
      }
    } else if (onPlayingStationChange) {
      onPlayingStationChange(null, false)
    }
  }, [currentlyPlaying, isPaused, onPlayingStationChange])

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

  const selectedLine = useMemo(() => 
    lines.find(line => line.id === selectedLineId),
    [lines, selectedLineId]
  )
  
  const lineStations = useMemo(() => {
    if (!selectedLine) return []
    
    return selectedLine.stations
      .map(stationId => stations.find(s => s.id === stationId))
      .filter(Boolean)
      .filter((station, index, arr) => {
        // Remove duplicate last station if it's the same as the first
        if (index === arr.length - 1 && arr.length > 1) {
          return station.id !== arr[0].id
        }
        return true
      })
  }, [selectedLine, stations])
  
  // Get line color or default
  const lineColor = selectedLine?.color || '#ef4444'
  
  // Memoized presets to avoid repeated calls
  const presets = useMemo(() => getAllPresets(), [])
  
  // Helper function to get all lines a station belongs to
  const getStationLines = useCallback((stationId) => {
    return lines.filter(line => line.stations.includes(stationId))
  }, [lines])

  // Load audio duration when assignment changes
  const loadAudioDuration = (slotId, url) => {
    const audio = new Audio(url)
    audio.preload = 'metadata'
    audio.addEventListener('loadedmetadata', () => {
      const duration = Math.ceil(audio.duration)
      if (duration && !isNaN(duration)) {
        setAudioDurations(prev => ({
          ...prev,
          [slotId]: duration
        }))
      }
    })
    audio.addEventListener('error', (e) => {
      console.error('Error loading audio metadata:', e)
    })
    audio.load()
  }

  // Format time in seconds to "Xs" or "Xm Ys"
  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  }

  // Get ordered queue of all audio slots
  const getOrderedQueue = () => {
    const queue = []
    lineStations.forEach((station, index) => {
      const stationSlotId = `station-${station.id}`
      if (audioAssignments[stationSlotId]?.url) {
        queue.push(stationSlotId)
      }
      
      if (index < lineStations.length - 1) {
        const betweenSlotId = `between-${station.id}-${lineStations[index + 1].id}`
        if (audioAssignments[betweenSlotId]?.url) {
          queue.push(betweenSlotId)
        }
        
        // Add extra between segments
        const extraSegments = betweenSegments[betweenSlotId] || []
        extraSegments.forEach(segmentId => {
          if (audioAssignments[segmentId]?.url) {
            queue.push(segmentId)
          }
        })
      }
    })
    return queue
  }

  // Calculate total duration of all assigned audio files
  const getTotalDuration = () => {
    let total = 0
    const queue = getOrderedQueue()
    queue.forEach(slotId => {
      if (audioDurations[slotId]) {
        total += audioDurations[slotId]
      }
    })
    return total
  }

  // Calculate elapsed time in queue
  const getElapsedTime = () => {
    let elapsed = 0
    const queue = getOrderedQueue()
    for (let i = 0; i < currentQueueIndex && i < queue.length; i++) {
      const slotId = queue[i]
      if (audioDurations[slotId]) {
        elapsed += audioDurations[slotId]
      }
    }
    // Add current audio progress
    if (queue[currentQueueIndex] && audioRef.current && !audioRef.current.paused) {
      elapsed += Math.ceil(audioRef.current.currentTime)
    }
    return elapsed
  }

  // Calculate remaining time in queue
  const getRemainingTime = () => {
    return getTotalDuration() - getElapsedTime()
  }

  // Auto-populate presets for all stations when line changes
  useEffect(() => {
    if (lineStations.length > 0 && selectedLineId) {
      const newAssignments = {}
      
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
          loadAudioDuration(stationSlotId, preset.path)
        } else {
          newAssignments[stationSlotId] = filteredAssignments[stationSlotId]
          if (filteredAssignments[stationSlotId].url) {
            loadAudioDuration(stationSlotId, filteredAssignments[stationSlotId].url)
          }
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
            loadAudioDuration(betweenSlotId, preset.path)
          } else {
            newAssignments[betweenSlotId] = filteredAssignments[betweenSlotId]
            if (filteredAssignments[betweenSlotId].url) {
              loadAudioDuration(betweenSlotId, filteredAssignments[betweenSlotId].url)
            }
          }
        }
      })
      
      setAudioAssignments(newAssignments)
    }
  }, [selectedLineId, lineStations.length])

  const getAnnouncementIcon = useCallback((slotId, type = 'station', customColor = null) => {
    const customType = announcementTypes[slotId] || type
    
    switch(customType) {
      case 'station':
        return <MapPin size={14} style={customColor ? { color: customColor } : {}} className={customColor ? '' : 'text-blue-500'} />
      case 'centralStation':
        return <Building2 size={14} style={customColor ? { color: customColor } : {}} className={customColor ? '' : 'text-purple-500'} />
      case 'arrival':
        return <ArrowDown size={14} className="text-green-500" />
      case 'departure':
        return <TrainFront size={14} className="text-orange-500" />
      case 'transfer':
        return <GitCommitVertical size={14} className="text-purple-500" />
      case 'information':
        return <Info size={14} className="text-cyan-500" />
      case 'live':
        return <MessageSquare size={14} className="text-pink-500" />
      case 'warning':
        return <AlertTriangle size={14} className="text-red-500" />
      case 'chime':
        return <Bell size={14} className="text-yellow-500" />
      case 'music':
        return <Music size={14} className="text-pink-500" />
      case 'ambience':
        return <Radio size={14} className="text-indigo-500" />
      case 'general':
      default:
        return <GitCommitVertical size={14} className="text-gray-400" />
    }
  }, [announcementTypes])

  const getAnnouncementLabel = useCallback((slotId, type = 'general') => {
    const customType = announcementTypes[slotId] || type
    
    switch(customType) {
      case 'station':
        return t('station')
      case 'centralStation':
        return t('centralStation')
      case 'arrival':
        return t('arrival')
      case 'departure':
        return t('departure')
      case 'transfer':
        return t('transfer')
      case 'information':
        return t('information')
      case 'live':
        return t('live')
      case 'warning':
        return t('warning')
      case 'chime':
        return t('chime')
      case 'music':
        return t('music')
      case 'ambience':
        return t('ambience')
      case 'general':
      default:
        return t('general')
    }
  }, [announcementTypes, t])
  
  // Render multi-colored circle for stations on multiple lines
  const renderStationCircle = (stationId) => {
    const stationLines = getStationLines(stationId)
    const colors = stationLines.map(line => line.color)
    
    if (colors.length === 0) {
      return (
        <div className="relative z-10 w-4 h-4 rounded-full bg-gray-400 dark:bg-gray-500 border-[3px] border-gray-200 dark:border-gray-700" />
      )
    }
    
    if (colors.length === 1) {
      return (
        <div 
          className="relative z-10 w-4 h-4 rounded-full border-[3px]" 
          style={{ 
            backgroundColor: colors[0],
            borderColor: colors[0]
          }} 
        />
      )
    }
    
    // Multi-color border using conic gradient
    const segmentAngle = 360 / colors.length
    const gradientStops = colors.map((color, idx) => {
      const start = idx * segmentAngle
      const end = (idx + 1) * segmentAngle
      return `${color} ${start}deg ${end}deg`
    }).join(', ')
    
    return (
      <div 
        className="relative z-10 w-4 h-4 rounded-full"
        style={{
          background: `conic-gradient(${gradientStops})`,
          padding: '3px'
        }}
      >
        <div 
          className="w-full h-full rounded-full" 
          style={{ backgroundColor: colors[0] }}
        />
      </div>
    )
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
      loadAudioDuration(slotId, url)
      setOpenDropdowns({})
    }
  }

  const getLocalizedAudioName = useCallback((assignment, slotId) => {
    if (!assignment) return ''
    
    // For preset audio, show just the name (no prefix)
    if (assignment.type === 'preset') {
      return assignment.name
    }
    // For uploaded audio, show localized "Uploaded: [name]"
    if (assignment.type === 'upload') {
      return `${t('audioTypeUpload')}: ${assignment.name}`
    }
    // For generated audio, show localized "AI Voice #[slot number]"
    if (assignment.type === 'generated') {
      // Extract slot number from slotId (e.g., "station-0" -> "1", "between-0-1" -> "1")
      if (!slotId) return `${t('audioTypeGenerated')} #1`
      
      const parts = slotId.split('-')
      const numericPart = parts.find(part => !isNaN(parseInt(part)))
      const slotNumber = numericPart ? parseInt(numericPart) + 1 : 1
      
      return `${t('audioTypeGenerated')} #${slotNumber}`
    }
    return assignment.name
  }, [t])

  const getPresetTextForSlot = useCallback((slotId, stationName) => {
    const announcementType = announcementTypes[slotId]
    
    // Misc icons (chime, music, ambience) have no preset text
    const miscTypes = ['chime', 'music', 'ambience']
    if (miscTypes.includes(announcementType)) {
      return ''
    }
    
    // Generate preset text based on announcement type using translations
    // Use replaceAll to handle multiple {station} placeholders (e.g., Japanese)
    switch(announcementType) {
      case 'arrival':
        return t('presetArrival').replaceAll('{station}', stationName)
      case 'departure':
        return t('presetDeparture').replaceAll('{station}', stationName)
      case 'transfer':
        return t('presetTransfer').replaceAll('{station}', stationName)
      case 'information':
        return t('presetInformation').replaceAll('{station}', stationName)
      case 'live':
        return t('presetLive').replaceAll('{station}', stationName)
      case 'warning':
        return t('presetWarning').replaceAll('{station}', stationName)
      case 'centralStation':
        return t('presetCentralStation').replaceAll('{station}', stationName)
      case 'station':
      default:
        return `${stationName}`
    }
  }, [announcementTypes, t])

  const handleGenerateAudio = useCallback(async (slotId, stationName) => {
    if (!apiKey || !aiTextInput.trim() || aiGenerationType !== 'text-to-speech') return
    
    setIsGeneratingAudio(true)
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${aiSelectedVoice}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: aiTextInput,
          model_id: 'eleven_multilingual_v2',
          output_format: 'mp3_44100_128'
        })
      })
      
      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        
        // Assign the generated audio to the slot
        setAudioAssignments(prev => ({
          ...prev,
          [slotId]: {
            url: audioUrl,
            name: `AI: ${aiTextInput.substring(0, 30)}${aiTextInput.length > 30 ? '...' : ''}`,
            type: 'generated'
          }
        }))
        
        // Load the audio duration
        loadAudioDuration(slotId, audioUrl)
        
        // Keep the panel open to show preview options
        // User can preview, regenerate, or close
      } else {
        console.error('Failed to generate audio:', response.status)
        const error = await response.text()
        console.error('Error details:', error)
        alert('Failed to generate audio. Please check your API key and try again.')
      }
    } catch (error) {
      console.error('Error generating audio:', error)
      alert('Error generating audio. Please try again.')
    } finally {
      setIsGeneratingAudio(false)
    }
  }, [apiKey, aiTextInput, aiSelectedVoice, aiGenerationType, loadAudioDuration])

  const handleSelectPreset = (slotId, preset) => {
    const url = preset.path || preset.url
    setAudioAssignments(prev => ({
      ...prev,
      [slotId]: {
        type: 'preset',
        url: url,
        name: preset.name
      }
    }))
    loadAudioDuration(slotId, url)
    setOpenDropdowns({})
  }

  const toggleDropdown = (slotId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [slotId]: !prev[slotId]
    }))
    setShowAIConfig(null)
  }

  const handleShowAIConfig = (slotId, stationName = '') => {
    setShowAIConfig(slotId)
    setOpenDropdowns({})
    const presetText = getPresetTextForSlot(slotId, stationName)
    setAiTextInput(presetText)
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

    if (currentlyPlaying === slotId && !isPaused) {
      // Pause current audio
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
        updateIntervalRef.current = null
      }
      if (queueUpdateIntervalRef.current) {
        clearInterval(queueUpdateIntervalRef.current)
        queueUpdateIntervalRef.current = null
      }
      setIsPaused(true)
      setIsPlayingAll(false) // Sync with master controller
    } else if (currentlyPlaying === slotId && isPaused) {
      // Resume paused audio
      if (audioRef.current) {
        audioRef.current.play()
        setIsPaused(false)
        // Restart the update interval
        updateIntervalRef.current = setInterval(() => {
          if (audioRef.current && !audioRef.current.paused) {
            const remaining = Math.ceil(audioRef.current.duration - audioRef.current.currentTime)
            setAudioRemainingTimes(prev => ({
              ...prev,
              [slotId]: remaining
            }))
          }
        }, 100)
      }
    } else {
      // Stop queue playback if active
      if (isPlayingAll) {
        setIsPlayingAll(false)
        if (queueUpdateIntervalRef.current) {
          clearInterval(queueUpdateIntervalRef.current)
          queueUpdateIntervalRef.current = null
        }
      }
      
      // Stop any current audio
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
      
      // Clear previous track's remaining time
      if (currentlyPlaying) {
        setAudioRemainingTimes(prev => {
          const newTimes = { ...prev }
          delete newTimes[currentlyPlaying]
          return newTimes
        })
      }
      
      // Play new audio
      setCurrentlyPlaying(slotId)
      setIsPaused(false)
      const audio = new Audio(assignment.url)
      audioRef.current = audio
      audio.playbackRate = playbackSpeed
      audio.volume = isMuted ? 0 : masterVolume
      
      // Update queue index to match
      const queue = getOrderedQueue()
      const index = queue.indexOf(slotId)
      if (index !== -1) {
        setCurrentQueueIndex(index)
      }
      
      // Update remaining time during playback
      updateIntervalRef.current = setInterval(() => {
        if (audio && !audio.paused) {
          const remaining = Math.ceil(audio.duration - audio.currentTime)
          setAudioRemainingTimes(prev => ({
            ...prev,
            [slotId]: remaining
          }))
        }
      }, 100)
      
      audio.onended = () => {
        setCurrentlyPlaying(null)
        setIsPaused(false)
        audioRef.current = null
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current)
          updateIntervalRef.current = null
        }
        setAudioRemainingTimes(prev => {
          const newTimes = { ...prev }
          delete newTimes[slotId]
          return newTimes
        })
      }
      audio.onerror = (e) => {
        console.error('Audio playback error:', e)
        setCurrentlyPlaying(null)
        setIsPaused(false)
        audioRef.current = null
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current)
          updateIntervalRef.current = null
        }
      }
      audio.play().catch(err => {
        console.error('Failed to play audio:', err)
        setCurrentlyPlaying(null)
        setIsPaused(false)
        audioRef.current = null
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current)
          updateIntervalRef.current = null
        }
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

  const handleMasterPlayPause = () => {
    if (isPlayingAll) {
      // Pause the queue
      setIsPlayingAll(false)
      setIsPaused(true)
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (queueUpdateIntervalRef.current) {
        clearInterval(queueUpdateIntervalRef.current)
        queueUpdateIntervalRef.current = null
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
        updateIntervalRef.current = null
      }
    } else {
      // Start or resume the queue
      const queue = getOrderedQueue()
      if (queue.length === 0) return
      
      // Stop any individual playback first
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
        updateIntervalRef.current = null
      }
      
      // If paused, resume from current position
      if (isPaused && currentlyPlaying && audioRef.current) {
        setIsPlayingAll(true)
        setIsPaused(false)
        audioRef.current.play().then(() => {
          startQueueProgressTracking()
          // Restart the update interval
          updateIntervalRef.current = setInterval(() => {
            if (audioRef.current && !audioRef.current.paused) {
              const remaining = Math.ceil(audioRef.current.duration - audioRef.current.currentTime)
              setAudioRemainingTimes(prev => ({
                ...prev,
                [currentlyPlaying]: remaining
              }))
            }
          }, 100)
        }).catch(err => {
          console.error('Failed to resume audio:', err)
          setIsPlayingAll(false)
          setIsPaused(true)
        })
      } else if (!currentlyPlaying || !queue.includes(currentlyPlaying)) {
        // Start from beginning if nothing is playing or current isn't in queue
        // Clean up any existing audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
        setCurrentQueueIndex(0)
        setIsPlayingAll(true)
        setIsPaused(false)
        // Use setTimeout to ensure state is set before starting playback
        setTimeout(() => playQueueFromIndex(0), 0)
    } else {
        // Audio is already playing, so just mark queue as active
      setIsPlayingAll(true)
        setIsPaused(false)
        startQueueProgressTracking()
      }
    }
  }

  const handleSkipPrev = () => {
    const queue = getOrderedQueue()
    if (queue.length === 0) return
    
    // Clean up previous track's remaining time
    if (currentlyPlaying) {
      setAudioRemainingTimes(prev => {
        const newTimes = { ...prev }
        delete newTimes[currentlyPlaying]
        return newTimes
      })
    }
    
    setIsPaused(false) // Reset pause state when skipping
    
    if (isPlayingAll) {
      // Skip to previous in queue
      const newIndex = currentQueueIndex > 0 ? currentQueueIndex - 1 : queue.length - 1
      setCurrentQueueIndex(newIndex)
      playQueueFromIndex(newIndex)
    } else {
      // Just load previous
      const newIndex = currentQueueIndex > 0 ? currentQueueIndex - 1 : queue.length - 1
      setCurrentQueueIndex(newIndex)
      setCurrentlyPlaying(queue[newIndex])
    }
  }

  const handleSkipNext = () => {
    const queue = getOrderedQueue()
    if (queue.length === 0) return
    
    // Clean up previous track's remaining time
    if (currentlyPlaying) {
      setAudioRemainingTimes(prev => {
        const newTimes = { ...prev }
        delete newTimes[currentlyPlaying]
        return newTimes
      })
    }
    
    setIsPaused(false) // Reset pause state when skipping
    
    if (isPlayingAll) {
      // Skip to next in queue
      const newIndex = (currentQueueIndex + 1) % queue.length
      setCurrentQueueIndex(newIndex)
      playQueueFromIndex(newIndex)
    } else {
      // Just load next
      const newIndex = (currentQueueIndex + 1) % queue.length
      setCurrentQueueIndex(newIndex)
      setCurrentlyPlaying(queue[newIndex])
    }
  }

  const startQueueProgressTracking = () => {
    if (queueUpdateIntervalRef.current) {
      clearInterval(queueUpdateIntervalRef.current)
    }
    queueUpdateIntervalRef.current = setInterval(() => {
      // Trigger re-render to update progress display
      setQueueProgress(Date.now())
    }, 500)
  }

  const playQueueFromIndex = async (startIndex) => {
    const queue = getOrderedQueue()
    if (startIndex >= queue.length) return
    
    // Stop current audio if any
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current)
      updateIntervalRef.current = null
    }
    
    // Start queue progress tracking
    startQueueProgressTracking()
    setIsPaused(false)
    
    for (let i = startIndex; i < queue.length; i++) {
      // Check ref instead of state for immediate value
      if (!isPlayingAllRef.current) break
      
      const slotId = queue[i]
      const assignment = audioAssignments[slotId]
      
      if (assignment?.url) {
        setCurrentQueueIndex(i)
          setCurrentlyPlaying(slotId)
        
        await new Promise((resolve) => {
          const audio = new Audio(assignment.url)
          audioRef.current = audio
          audio.playbackRate = playbackSpeed
          audio.volume = isMuted ? 0 : masterVolume
          
          // Track individual audio progress
          updateIntervalRef.current = setInterval(() => {
            if (audio && !audio.paused) {
              const remaining = Math.ceil(audio.duration - audio.currentTime)
              setAudioRemainingTimes(prev => ({
                ...prev,
                [slotId]: remaining
              }))
            }
          }, 100)
          
          audio.onended = () => {
            if (updateIntervalRef.current) {
              clearInterval(updateIntervalRef.current)
              updateIntervalRef.current = null
            }
            setAudioRemainingTimes(prev => {
              const newTimes = { ...prev }
              delete newTimes[slotId]
              return newTimes
            })
            resolve()
          }
          
          audio.onerror = (e) => {
            console.error('Audio playback error:', e)
            if (updateIntervalRef.current) {
              clearInterval(updateIntervalRef.current)
              updateIntervalRef.current = null
            }
            resolve()
          }
          
          audio.play().catch(err => {
            console.error('Failed to play audio:', err)
            if (updateIntervalRef.current) {
              clearInterval(updateIntervalRef.current)
              updateIntervalRef.current = null
            }
            resolve()
          })
        })
      }
    }
    
    // Queue finished
    setIsPlayingAll(false)
    setIsPaused(false)
    setCurrentlyPlaying(null)
    setCurrentQueueIndex(0)
    audioRef.current = null
    if (queueUpdateIntervalRef.current) {
      clearInterval(queueUpdateIntervalRef.current)
      queueUpdateIntervalRef.current = null
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (queueUpdateIntervalRef.current) {
        clearInterval(queueUpdateIntervalRef.current)
      }
    }
  }, [])

  const renderAudioSlot = (slotId, label, stationId = null, slotIndex = 0, isExtraSegment = false, parentSlotId = null) => {
    const assignment = audioAssignments[slotId]
    const isSelected = stationId && stationId === selectedStationId
    const isPlaying = currentlyPlaying === slotId
    const isPlayingAndNotPaused = isPlaying && !isPaused
    const isDropdownOpen = openDropdowns[slotId]
    const isAIConfigOpen = showAIConfig === slotId
    const isTypeDropdownOpen = openDropdowns[`${slotId}-type`]
    const slotType = slotId.startsWith('between') || isExtraSegment ? 'general' : 'station'
    const isStation = !slotId.startsWith('between') && !isExtraSegment

    return (
      <div 
        className={`border rounded-lg transition-all overflow-visible ${
          isPlayingAndNotPaused 
            ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
            : isSelected 
            ? 'ring-2 ring-blue-500 border-blue-500' 
            : 'border-gray-200 dark:border-gray-700'
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
          {/* Top row: Prefix space + Icon/Number, Label, Remove button, Duration */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {/* Prefix space for station number OR icon selector */}
              <div className="w-5 flex items-center justify-center flex-shrink-0">
                {showStationNumbers && isStation ? (
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {slotIndex / 2 + 1}
                  </span>
                ) : (
                  <div className="relative" ref={el => dropdownRefs.current[`${slotId}-type`] = el}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleDropdown(`${slotId}-type`)
                      }}
                      className="flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded p-0.5 transition-colors"
                    >
                      {getAnnouncementIcon(slotId, slotType, isStation ? lineColor : null)}
                    </button>
                    
                    {isTypeDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1 min-w-[160px]">
                        {isStation ? (
                          <>
                            <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pointer-events-none">
                              {t('stationTypes')}
            </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                                handleTypeChange(slotId, 'station')
                                setOpenDropdowns({})
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm"
                            >
                              <MapPin size={14} className="text-blue-500" />
                              <span className="text-gray-700 dark:text-gray-300">{t('station')}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTypeChange(slotId, 'centralStation')
                                setOpenDropdowns({})
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm"
                            >
                              <Building2 size={14} className="text-purple-500" />
                              <span className="text-gray-700 dark:text-gray-300">{t('centralStation')}</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pointer-events-none">
                              {t('announcements')}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTypeChange(slotId, 'general')
                                setOpenDropdowns({})
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm"
                            >
                              <GitCommitVertical size={14} className="text-gray-400" />
                              <span className="text-gray-700 dark:text-gray-300">{t('general')}</span>
              </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTypeChange(slotId, 'arrival')
                                setOpenDropdowns({})
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm"
                            >
                              <ArrowDown size={14} className="text-green-500" />
                              <span className="text-gray-700 dark:text-gray-300">{t('arrival')}</span>
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
                              <span className="text-gray-700 dark:text-gray-300">{t('departure')}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTypeChange(slotId, 'transfer')
                                setOpenDropdowns({})
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm"
                            >
                              <GitCommitVertical size={14} className="text-purple-500" />
                              <span className="text-gray-700 dark:text-gray-300">{t('transfer')}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTypeChange(slotId, 'information')
                                setOpenDropdowns({})
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm"
                            >
                              <Info size={14} className="text-cyan-500" />
                              <span className="text-gray-700 dark:text-gray-300">{t('information')}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTypeChange(slotId, 'live')
                                setOpenDropdowns({})
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm"
                            >
                              <MessageSquare size={14} className="text-pink-500" />
                              <span className="text-gray-700 dark:text-gray-300">{t('live')}</span>
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
                              <span className="text-gray-700 dark:text-gray-300">{t('warning')}</span>
                            </button>
                            <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                            <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pointer-events-none">
                              {t('misc')}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTypeChange(slotId, 'chime')
                                setOpenDropdowns({})
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm"
                            >
                              <Bell size={14} className="text-yellow-500" />
                              <span className="text-gray-700 dark:text-gray-300">{t('chime')}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTypeChange(slotId, 'music')
                                setOpenDropdowns({})
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm"
                            >
                              <Music size={14} className="text-pink-500" />
                              <span className="text-gray-700 dark:text-gray-300">{t('music')}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTypeChange(slotId, 'ambience')
                                setOpenDropdowns({})
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left text-sm"
                            >
                              <Radio size={14} className="text-indigo-500" />
                              <span className="text-gray-700 dark:text-gray-300">{t('ambience')}</span>
                            </button>
                          </>
            )}
          </div>
                    )}
                </div>
                )}
              </div>
              
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
              </div>
              
            {/* Duration counter - aligned right */}
            {assignment && audioDurations[slotId] && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex-shrink-0 font-medium">
                {audioRemainingTimes[slotId] !== undefined 
                  ? formatTime(audioRemainingTimes[slotId])
                  : formatTime(audioDurations[slotId])
                }
              </span>
            )}
          </div>

          {/* Bottom row: Prefix space + Dropdown and Play button */}
          <div className="flex items-center gap-2">
            {/* Prefix space for animated audio SVG */}
            <div className="w-5 flex items-center justify-center flex-shrink-0">
              {isPlayingAndNotPaused && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500 text-white rounded">
                  <SoundWave />
                </div>
              )}
            </div>
            
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
                  {assignment ? getLocalizedAudioName(assignment, slotId) : 'Select audio...'}
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
                      handleShowAIConfig(slotId, label)
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
                {isPlayingAndNotPaused ? (
                  <Pause size={14} className="text-blue-500" />
                ) : (
                  <Play size={14} className="text-gray-600 dark:text-gray-400" />
                )}
              </button>
            )}
          </div>

          {isAIConfigOpen && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 max-w-full overflow-hidden">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">AI Generation</p>
              
              {/* Generation Type Radio Buttons */}
              <div className="space-y-2 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
              <input
                    type="radio"
                    name="generationType"
                    value="text-to-speech"
                    checked={aiGenerationType === 'text-to-speech'}
                    onChange={(e) => setAiGenerationType(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Text-to-Speech</span>
                </label>
                <label className="flex items-center gap-2 cursor-not-allowed opacity-50">
                  <input
                    type="radio"
                    name="generationType"
                    value="sound-effects"
                    disabled
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Sound Effects (Coming Soon)</span>
                </label>
                <label className="flex items-center gap-2 cursor-not-allowed opacity-50">
                  <input
                    type="radio"
                    name="generationType"
                    value="music"
                    disabled
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Music (Coming Soon)</span>
                </label>
              </div>

              {/* Text-to-Speech Form */}
              {aiGenerationType === 'text-to-speech' && (
                <div className="space-y-3 max-w-full">
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Text</label>
                    <textarea
                      value={aiTextInput}
                      onChange={(e) => setAiTextInput(e.target.value)}
                      placeholder="Enter the text to convert to speech..."
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Voice</label>
                    <div className="text-xs text-gray-500 dark:text-gray-400 py-1.5 italic">
                      Using default voice (Rachel)
                    </div>
                  </div>

                  {/* Audio Preview (if generated) */}
                  {assignment && assignment.type === 'generated' && !isGeneratingAudio && (
                    <div className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{getLocalizedAudioName(assignment, slotId)}</p>
                        </div>
                        <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                              if (currentlyPlaying === slotId) {
                                handleStop()
                              } else {
                                handlePlayAudio(slotId)
                              }
                            }}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            title={currentlyPlaying === slotId ? 'Stop' : 'Play'}
                          >
                            {currentlyPlaying === slotId ? (
                              <Pause size={16} className="text-gray-700 dark:text-gray-300" />
                            ) : (
                              <Play size={16} className="text-gray-700 dark:text-gray-300" />
                            )}
              </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveAudio(slotId)
                            }}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            title="Remove"
                          >
                            <X size={16} className="text-gray-700 dark:text-gray-300" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleGenerateAudio(slotId, label)
                }}
                  disabled={isGeneratingAudio || !aiTextInput.trim()}
                  className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGeneratingAudio ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    assignment && assignment.type === 'generated' ? 'Regenerate' : 'Generate'
                  )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                    setShowAIConfig(null)
                    setAiTextInput('')
                }}
                  disabled={isGeneratingAudio}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm transition-colors disabled:opacity-50"
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
          <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t('audioQueue')}</h2>
            {getTotalDuration() > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                {formatTime(getTotalDuration())}
              </span>
            )}
          </div>
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
                onClick={handleSkipPrev}
                className="flex items-center justify-center p-1.5 rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Previous in Queue"
              >
                <SkipBack size={16} />
              </button>
              
              <button
                onClick={handleMasterPlayPause}
                className="flex items-center justify-center p-2 rounded-lg transition-colors bg-blue-500 hover:bg-blue-600 text-white"
                title="Play/Pause Queue"
              >
                {isPlayingAll ? <Pause size={18} /> : <Play size={18} />}
              </button>
              
              <button
                onClick={handleSkipNext}
                className="flex items-center justify-center p-1.5 rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Next in Queue"
              >
                <SkipForward size={16} />
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

              <button
                onClick={() => setShowTranscription(!showTranscription)}
                className={`flex items-center justify-center p-1.5 rounded-lg transition-colors ${
                  showTranscription 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={t('transcription')}
              >
                <FileText size={16} />
              </button>
            </div>

            {/* Queue Progress Display */}
            <div className="mb-1.5 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  {currentQueueIndex + 1} / {getOrderedQueue().length}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {isPlayingAll ? formatTime(getRemainingTime()) : formatTime(getTotalDuration())}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-100"
                  style={{ 
                    width: `${getTotalDuration() > 0 ? ((getTotalDuration() - getRemainingTime()) / getTotalDuration() * 100) : 0}%` 
                  }}
                />
              </div>
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
            {/* Audio slots column with integrated timeline markers */}
            <div className="flex-1 min-w-0 overflow-visible">
            {lineStations.map((station, index) => {
              let slotIndex = index * 2
                const stationSlotId = `station-${station.id}`
                const betweenSlotId = `between-${station.id}-${lineStations[index + 1]?.id}`
                const isLastStation = index === lineStations.length - 1
                const isFirstStation = index === 0
                
              return (
                  <div key={`slot-group-${station.id}`}>
                    {/* Station row with aligned circle */}
                    <div className="flex gap-2">
                      {/* Timeline marker - circle centered with station box, line passes through */}
                      <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: '20px' }}>
                        {/* Continuous line passing through */}
                        {!isFirstStation && (
                          <div 
                            className="absolute w-0.5 left-1/2 -translate-x-1/2" 
                            style={{ 
                              bottom: '50%', 
                              top: 0,
                              backgroundColor: lineColor,
                              opacity: 0.6
                            }} 
                          />
                        )}
                        {!isLastStation && (
                          <div 
                            className="absolute w-0.5 left-1/2 -translate-x-1/2" 
                            style={{ 
                              top: '50%', 
                              bottom: 0,
                              backgroundColor: lineColor,
                              opacity: 0.6
                            }} 
                          />
                        )}
                        
                        {/* Circle on top of line */}
                        {renderStationCircle(station.id)}
                      </div>
                      
                      {/* Station slot box */}
                      <div className="flex-1 min-w-0">
                  {renderAudioSlot(
                          stationSlotId,
                          station.name,
                    station.id,
                    slotIndex
                  )}
                      </div>
                    </div>
                  
                      {/* Between content with line */}
                  {index < lineStations.length - 1 && (
                        <div className="flex gap-2">
                          {/* Timeline line */}
                          <div className="flex flex-col items-center flex-shrink-0" style={{ width: '20px' }}>
                            <div className="w-0.5 flex-1" style={{ backgroundColor: lineColor, opacity: 0.6 }} />
                          </div>
                        
                        {/* Between content */}
                        <div 
                          className="relative flex-1 my-3 pl-8 pr-0"
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
                            getAnnouncementLabel(betweenSlotId, 'general'),
                        null,
                        slotIndex + 1
                          )}
                          
                          {/* Extra between segments */}
                          {(betweenSegments[betweenSlotId] || []).map((segmentId) => (
                            <div key={segmentId}>
                              {renderAudioSlot(
                                segmentId,
                                getAnnouncementLabel(segmentId, 'general'),
                                null,
                                slotIndex + 1,
                                true,
                                betweenSlotId
                              )}
                            </div>
                          ))}
                        </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Loop indicator for last station */}
                    {isLastStation && lineStations.length > 1 && (
                      <div className="flex gap-2">
                        <div className="flex-shrink-0" style={{ width: '20px' }} />
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mt-3">
                          <RotateCcw size={12} className="flex-shrink-0" />
                          <span>Returns to {lineStations[0].name}</span>
                        </div>
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


