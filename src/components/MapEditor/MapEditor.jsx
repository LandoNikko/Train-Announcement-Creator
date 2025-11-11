import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { ScanEye, CheckCircle, GitCommitVertical, FileText, Info, ZoomIn, ZoomOut, Dot, Minus, Plus, X, EyeOff, Fullscreen, ChevronUp, ChevronDown, Circle, Type, GitBranch as LineIcon, Grid3x3, Eye } from 'lucide-react'
import GridCanvas from './GridCanvas'
import StationMarker from './StationMarker'
import TrainLine from './TrainLine'
import LineStationEditor from './LineStationEditor'
import { useTranslation } from '../../hooks/useTranslation'
import { useHoldToChange } from '../../hooks/useHoldToChange'
import { getNextStationName } from '../../data/stationNames'
import { SoundWave } from '../AnnouncementEditor/AnnouncementPanel'
import { trainPresets } from '../../data/presets'

const MapEditor = forwardRef(({ 
  stations, 
  setStations, 
  setStationsNoHistory,
  lines, 
  setLines, 
  setStationsAndLines,
  currentTool,
  setCurrentTool,
  selectedStations,
  setSelectedStations,
  gridZoom = 1,
  onGridZoomChange,
  language = 'en',
  lineStyle = 'smooth',
  onLineStyleChange,
  gridStyle = 'dots',
  onGridStyleChange,
  showStationNumbers = false,
  isMobile = false,
  selectedStationId = null,
  playingStationId = null,
  isStationPlaying = false,
  showTranscription = false,
  setShowTranscription,
  currentTranscription = '',
  selectedLineId = null,
  labelSize = 1,
  onLabelSizeChange,
  lineThickness = 1,
  onLineThicknessChange,
  markerSize = 1,
  onMarkerSizeChange,
  gridThickness = 1,
  onGridThicknessChange,
  gridOpacity = 1,
  onGridOpacityChange,
  currentPresetId = null,
  customTransitSystems = []
}, ref) => {
  const { t } = useTranslation(language)
  
  // Get current transit system name
  const allSystems = [...customTransitSystems, ...trainPresets]
  const currentSystem = allSystems.find(s => s.id === currentPresetId)
  const transitSystemName = currentSystem 
    ? (currentSystem.isCopy && currentSystem.nameKey ? `${t(currentSystem.nameKey)} (${t('copy')})` : t(currentSystem.name))
    : t('trainLine')
  
  const markerSizeDecrease = useHoldToChange(onMarkerSizeChange, -0.05)
  const markerSizeIncrease = useHoldToChange(onMarkerSizeChange, 0.05)
  const labelSizeDecrease = useHoldToChange(onLabelSizeChange, -0.05)
  const labelSizeIncrease = useHoldToChange(onLabelSizeChange, 0.05)
  const lineThicknessDecrease = useHoldToChange(onLineThicknessChange, -0.05)
  const lineThicknessIncrease = useHoldToChange(onLineThicknessChange, 0.05)
  const gridThicknessDecrease = useHoldToChange(onGridThicknessChange, -0.05)
  const gridThicknessIncrease = useHoldToChange(onGridThicknessChange, 0.05)
  const gridOpacityDecrease = useHoldToChange(onGridOpacityChange, -0.05)
  const gridOpacityIncrease = useHoldToChange(onGridOpacityChange, 0.05)
  
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [editingStation, setEditingStation] = useState(null)
  const [editingLine, setEditingLine] = useState(null)
  const [draggingStation, setDraggingStation] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hoverGridPoint, setHoverGridPoint] = useState(null)
  const [mousePosition, setMousePosition] = useState(null)
  const [lineCreationStations, setLineCreationStations] = useState([])
  const [pathCreationPoints, setPathCreationPoints] = useState([])
  const [currentLineColor, setCurrentLineColor] = useState('#ef4444')
  const [isAnimating, setIsAnimating] = useState(false)
  const [showLoopModal, setShowLoopModal] = useState(false)
  const [loopModalData, setLoopModalData] = useState(null)
  const [stationBeforeDrag, setStationBeforeDrag] = useState(null)
  const [showCanvasStyle, setShowCanvasStyle] = useState(false)
  const [lastTouchDistance, setLastTouchDistance] = useState(null)
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const animationFrameRef = useRef(null)
  const zoomIntervalRef = useRef(null)
  const currentZoomRef = useRef(gridZoom)
  
  const gridSpacing = 30 * gridZoom
  const snapToGrid = (coord) => Math.round(coord / gridSpacing) * gridSpacing

  const handleZoomChange = (targetZoom) => {
    const clampedZoom = Math.max(0.7, Math.min(5, targetZoom))
    
    if (clampedZoom !== gridZoom && onGridZoomChange) {
      const centerX = viewBox.x + viewBox.width / 2
      const centerY = viewBox.y + viewBox.height / 2
      const scale = clampedZoom / gridZoom
      
      const newX = centerX - (centerX - viewBox.x) / scale
      const newY = centerY - (centerY - viewBox.y) / scale
      
      const newSpacing = 30 * clampedZoom
      const updatedStations = stations.map(station => {
        if (station.gridIndexX !== undefined && station.gridIndexY !== undefined) {
          return {
            ...station,
            x: station.gridIndexX * newSpacing,
            y: station.gridIndexY * newSpacing
          }
        }
        return station
      })
      
      setStationsNoHistory(updatedStations)
      setViewBox(prev => ({ ...prev, x: newX, y: newY }))
      onGridZoomChange(clampedZoom)
      currentZoomRef.current = clampedZoom
    }
  }

  useEffect(() => {
    currentZoomRef.current = gridZoom
  }, [gridZoom])

  const startZoomHold = (direction) => {
    if (zoomIntervalRef.current) return
    
    zoomIntervalRef.current = setInterval(() => {
      const targetZoom = currentZoomRef.current + (direction * 0.05)
      handleZoomChange(targetZoom)
    }, 50)
  }

  const stopZoomHold = () => {
    if (zoomIntervalRef.current) {
      clearInterval(zoomIntervalRef.current)
      zoomIntervalRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (zoomIntervalRef.current) {
        clearInterval(zoomIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const spacing = 30 * gridZoom
    const updatedStations = stations.map(station => {
      if (station.gridIndexX !== undefined && station.gridIndexY !== undefined) {
        return {
          ...station,
          x: station.gridIndexX * spacing,
          y: station.gridIndexY * spacing
        }
      }
      return station
    })
    setStationsNoHistory(updatedStations)
  }, [gridZoom])

  useEffect(() => {
    const updateViewBoxSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setViewBox(prev => ({
          ...prev,
          width: rect.width || 1200,
          height: rect.height || 800
        }))
      }
    }
    
    updateViewBoxSize()
    window.addEventListener('resize', updateViewBoxSize)
    return () => window.removeEventListener('resize', updateViewBoxSize)
  }, [])

  useEffect(() => {
    if (currentTool !== 'createLine') {
      setLineCreationStations([])
    }
    if (currentTool !== 'drawPath') {
      setPathCreationPoints([])
    }
  }, [currentTool])

  const getSVGPoint = (clientX, clientY) => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const pt = svgRef.current.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM().inverse())
    return { x: svgP.x, y: svgP.y }
  }

  const getLineColors = () => {
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']
    const lineCount = lines.length
    return colors[lineCount % colors.length]
  }

  const getLinePrefix = (lineIndex) => {
    if (lines.length <= 1) return null
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return letters[lineIndex % letters.length]
  }

  // Helper function to find closest point on a line segment
  const getClosestPointOnSegment = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1
    const dy = y2 - y1
    const lengthSquared = dx * dx + dy * dy
    
    if (lengthSquared === 0) return { x: x1, y: y1, distance: Math.sqrt((px - x1) ** 2 + (py - y1) ** 2) }
    
    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared
    t = Math.max(0, Math.min(1, t))
    
    const closestX = x1 + t * dx
    const closestY = y1 + t * dy
    const distance = Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2)
    
    return { x: closestX, y: closestY, distance, t }
  }

  // Helper function to check if a station is near any line and insert it
  const addStationToNearbyLine = (newStation) => {
    const proximityThreshold = gridSpacing * 1
    
    for (const line of lines) {
      const lineStations = line.stations
        .map(id => stations.find(s => s.id === id))
        .filter(Boolean)
      
      if (lineStations.length < 2) continue
      
      // Check each segment of the line
      for (let i = 0; i < lineStations.length - 1; i++) {
        const s1 = lineStations[i]
        const s2 = lineStations[i + 1]
        
        const closest = getClosestPointOnSegment(
          newStation.x, newStation.y,
          s1.x, s1.y,
          s2.x, s2.y
        )
        
        if (closest.distance <= proximityThreshold) {
          // Insert the station into the line at this position
          const updatedLines = lines.map(l => {
            if (l.id === line.id) {
              const newStations = [...l.stations]
              newStations.splice(i + 1, 0, newStation.id)
              return { ...l, stations: newStations }
            }
            return l
          })
          
          // Update station color to match line
          const stationWithColor = { ...newStation, color: line.color }
          
          // Use combined update for atomic operation
          if (setStationsAndLines) {
            setStationsAndLines([...stations, stationWithColor], updatedLines)
          } else {
            setStations([...stations, stationWithColor])
            setLines(updatedLines)
          }
          return true
        }
      }
    }
    
    // No line nearby, just add the station
    setStations([...stations, newStation])
    return false
  }

  const handleCanvasClick = (e) => {
    if (currentTool === 'station') {
      if (e.target.tagName === 'circle' && e.target.classList.contains('grid-dot')) {
        const cx = parseFloat(e.target.getAttribute('cx'))
        const cy = parseFloat(e.target.getAttribute('cy'))
        
        const gridIndexX = Math.round(cx / gridSpacing)
        const gridIndexY = Math.round(cy / gridSpacing)
        
        const newStation = {
          id: `station-${Date.now()}`,
          gridIndexX,
          gridIndexY,
          x: cx,
          y: cy,
          name: getNextStationName(stations, language),
          color: '#3b82f6'
        }
        addStationToNearbyLine(newStation)
      } else if (e.target.tagName === 'rect' || e.target === svgRef.current) {
        const svgPoint = getSVGPoint(e.clientX, e.clientY)
        const nearestX = Math.round(svgPoint.x / gridSpacing) * gridSpacing
        const nearestY = Math.round(svgPoint.y / gridSpacing) * gridSpacing
        
        const gridIndexX = Math.round(nearestX / gridSpacing)
        const gridIndexY = Math.round(nearestY / gridSpacing)
        
        const newStation = {
          id: `station-${Date.now()}`,
          gridIndexX,
          gridIndexY,
          x: nearestX,
          y: nearestY,
          name: getNextStationName(stations, language),
          color: '#3b82f6'
        }
        addStationToNearbyLine(newStation)
      }
    }
    else if (currentTool === 'createLine') {
      if (e.target.tagName === 'circle' && e.target.classList.contains('grid-dot')) {
        const cx = parseFloat(e.target.getAttribute('cx'))
        const cy = parseFloat(e.target.getAttribute('cy'))
        
        const gridIndexX = Math.round(cx / gridSpacing)
        const gridIndexY = Math.round(cy / gridSpacing)
        
        const newStation = {
          id: `station-${Date.now()}-${lineCreationStations.length}`,
          gridIndexX,
          gridIndexY,
          x: cx,
          y: cy,
          name: getNextStationName([...stations, ...lineCreationStations], language),
          color: currentLineColor
        }
        setLineCreationStations([...lineCreationStations, newStation])
      } else if (e.target.tagName === 'rect' || e.target === svgRef.current) {
        const svgPoint = getSVGPoint(e.clientX, e.clientY)
        const nearestX = Math.round(svgPoint.x / gridSpacing) * gridSpacing
        const nearestY = Math.round(svgPoint.y / gridSpacing) * gridSpacing
        
        const gridIndexX = Math.round(nearestX / gridSpacing)
        const gridIndexY = Math.round(nearestY / gridSpacing)
        
        const newStation = {
          id: `station-${Date.now()}-${lineCreationStations.length}`,
          gridIndexX,
          gridIndexY,
          x: nearestX,
          y: nearestY,
          name: getNextStationName([...stations, ...lineCreationStations], language),
          color: currentLineColor
        }
        setLineCreationStations([...lineCreationStations, newStation])
      }
    }
    else if (currentTool === 'drawPath') {
      if (e.target.tagName === 'circle' && e.target.classList.contains('grid-dot')) {
        const cx = parseFloat(e.target.getAttribute('cx'))
        const cy = parseFloat(e.target.getAttribute('cy'))
        
        const gridIndexX = Math.round(cx / gridSpacing)
        const gridIndexY = Math.round(cy / gridSpacing)
        
        setPathCreationPoints([...pathCreationPoints, { x: cx, y: cy, gridIndexX, gridIndexY }])
      } else if (e.target.tagName === 'rect' || e.target === svgRef.current) {
        const svgPoint = getSVGPoint(e.clientX, e.clientY)
        const nearestX = Math.round(svgPoint.x / gridSpacing) * gridSpacing
        const nearestY = Math.round(svgPoint.y / gridSpacing) * gridSpacing
        
        const gridIndexX = Math.round(nearestX / gridSpacing)
        const gridIndexY = Math.round(nearestY / gridSpacing)
        
        setPathCreationPoints([...pathCreationPoints, { x: nearestX, y: nearestY, gridIndexX, gridIndexY }])
      }
    }
  }
  
  const handleLineCreationStationClick = (station, e) => {
    if (currentTool === 'createLine') {
      e.stopPropagation()
      
      // Check if clicking the first created station to create a loop
      if (lineCreationStations.length >= 2 && lineCreationStations[0].id === station.id) {
        // Create a loop line by finishing with the first station
        finishLineCreation(true)
      } 
      // Check if clicking the first existing station (when we have at least one created station)
      else if (lineCreationStations.length >= 1 && lineCreationStations[0].id === station.id) {
        // Complete the loop
        finishLineCreation(true)
      }
      else {
        setLineCreationStations([...lineCreationStations, station])
      }
    }
  }
  
  const handlePathCreationStationClick = (station, e) => {
    if (currentTool === 'drawPath') {
      e.stopPropagation()
      setPathCreationPoints([...pathCreationPoints, { x: station.x, y: station.y, gridIndexX: station.gridIndexX, gridIndexY: station.gridIndexY }])
    }
  }

  const handleStationClick = (station, e) => {
    e.stopPropagation()
    
    if (currentTool === 'select') {
      setEditingStation(station)
    }
  }

  const handleStationMouseDown = (station, e) => {
    if (currentTool === 'select') {
      e.stopPropagation()
      const svgPoint = getSVGPoint(e.clientX, e.clientY)
      setDraggingStation(station)
      setEditingStation(null)
      setEditingLine(null)
      setStationBeforeDrag({ ...station })
      setDragOffset({
        x: svgPoint.x - station.x,
        y: svgPoint.y - station.y
      })
    }
  }

  const handleStationTouchStart = (station, e) => {
    if (currentTool === 'select' && e.touches.length === 1) {
      e.stopPropagation()
      const touch = e.touches[0]
      const svgPoint = getSVGPoint(touch.clientX, touch.clientY)
      setDraggingStation(station)
      setEditingStation(null)
      setEditingLine(null)
      setStationBeforeDrag({ ...station })
      setDragOffset({
        x: svgPoint.x - station.x,
        y: svgPoint.y - station.y
      })
    }
  }

  const handleStationUpdate = (updatedStation) => {
    const updatedStations = stations.map(s => s.id === updatedStation.id ? updatedStation : s)
    setStations(updatedStations)
  }

  const handleStationDelete = (stationId) => {
    setStations(stations.filter(s => s.id !== stationId))
    
    const updatedLines = lines.map(line => ({
      ...line,
      stations: line.stations.filter(id => id !== stationId)
    })).filter(line => line.stations.length >= 2)
    
    setLines(updatedLines)
    setEditingStation(null)
  }

  const handleLineUpdate = (updatedLine, shouldUpdateStationColors = false) => {
    const updatedLines = lines.map(line => 
      line.id === updatedLine.id ? updatedLine : line
    )
    
    // If color changed, update all connected stations atomically
    if (shouldUpdateStationColors && updatedLine.stations) {
      const updatedStations = stations.map(station => 
        updatedLine.stations.includes(station.id) 
          ? { ...station, color: updatedLine.color }
          : station
      )
      setStations(updatedStations)
    }
    
    setLines(updatedLines)
    setEditingLine(updatedLine)
  }

  const handleLineDelete = (lineId) => {
    setLines(lines.filter(l => l.id !== lineId))
    setEditingLine(null)
  }

  const handleLineClick = (line, e) => {
    if (currentTool === 'select') {
      e.stopPropagation()
      setEditingLine(line)
      setEditingStation(null)
    }
  }

  const handleMouseDown = (e) => {
    const canPan = e.button === 1 || (e.button === 0 && e.shiftKey) || (e.button === 0 && currentTool === 'select' && (e.target.tagName === 'rect' || e.target === svgRef.current))
    
    if (canPan) {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
      setEditingStation(null)
      setEditingLine(null)
      e.preventDefault()
    }
  }

  const handleTouchStart = (e) => {
    // Handle two-finger pinch for zooming
    if (e.touches.length === 2) {
      e.preventDefault()
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      setLastTouchDistance(distance)
      setIsPanning(false)
      return
    }
    
    // Only handle single-finger touch for panning
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      const target = e.target
      
      // Allow panning when touching the background (rect or svg), not stations or lines
      const canPan = currentTool === 'select' && (target.tagName === 'rect' || target === svgRef.current)
      
      if (canPan) {
        setIsPanning(true)
        setPanStart({ x: touch.clientX, y: touch.clientY })
        setEditingStation(null)
        setEditingLine(null)
        e.preventDefault()
      }
    }
  }

  const handleTouchMove = (e) => {
    // Handle two-finger pinch for zooming
    if (e.touches.length === 2 && lastTouchDistance !== null) {
      e.preventDefault()
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      const delta = (distance - lastTouchDistance) * 0.007
      const targetZoom = gridZoom + delta
      
      handleZoomChange(targetZoom)
      setLastTouchDistance(distance)
      return
    }
    
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      const svgPoint = getSVGPoint(touch.clientX, touch.clientY)
      setMousePosition(svgPoint)

      if (currentTool === 'createLine' || currentTool === 'drawPath' || currentTool === 'station') {
        const nearestX = Math.round(svgPoint.x / gridSpacing) * gridSpacing
        const nearestY = Math.round(svgPoint.y / gridSpacing) * gridSpacing
        setHoverGridPoint({ x: nearestX, y: nearestY })
      } else {
        setHoverGridPoint(null)
      }

      if (draggingStation) {
        e.preventDefault() // Prevent scrolling while dragging
        const newX = snapToGrid(svgPoint.x - dragOffset.x)
        const newY = snapToGrid(svgPoint.y - dragOffset.y)
        
        setStationsNoHistory(prev => prev.map(s => 
          s.id === draggingStation.id 
            ? { 
                ...s, 
                x: newX, 
                y: newY,
                gridIndexX: Math.round(newX / gridSpacing),
                gridIndexY: Math.round(newY / gridSpacing)
              }
            : s
        ))
      } else if (isPanning) {
        e.preventDefault() // Prevent scrolling while panning
        const dx = (touch.clientX - panStart.x) * 0.5
        const dy = (touch.clientY - panStart.y) * 0.5
        setViewBox(prev => ({
          ...prev,
          x: prev.x - dx,
          y: prev.y - dy
        }))
        setPanStart({ x: touch.clientX, y: touch.clientY })
      }
    }
  }

  const handleTouchEnd = () => {
    setLastTouchDistance(null)
    handleMouseUp()
  }

  const handleWheel = (e) => {
    // Only zoom when shift key is pressed
    if (e.shiftKey) {
      e.preventDefault()
      
      const delta = -e.deltaY * 0.0015
      const targetZoom = gridZoom + delta
      
      handleZoomChange(targetZoom)
    }
  }

  const handleMouseMove = (e) => {
    const svgPoint = getSVGPoint(e.clientX, e.clientY)
    setMousePosition(svgPoint)

    if (currentTool === 'createLine' || currentTool === 'drawPath' || currentTool === 'station') {
      const nearestX = Math.round(svgPoint.x / gridSpacing) * gridSpacing
      const nearestY = Math.round(svgPoint.y / gridSpacing) * gridSpacing
      setHoverGridPoint({ x: nearestX, y: nearestY })
    } else {
      setHoverGridPoint(null)
    }

    if (draggingStation) {
      const newX = snapToGrid(svgPoint.x - dragOffset.x)
      const newY = snapToGrid(svgPoint.y - dragOffset.y)
      
      setStationsNoHistory(prev => prev.map(s => 
        s.id === draggingStation.id 
          ? { 
              ...s, 
              x: newX, 
              y: newY,
              gridIndexX: Math.round(newX / gridSpacing),
              gridIndexY: Math.round(newY / gridSpacing)
            }
          : s
      ))
    } else if (isPanning) {
      const dx = (e.clientX - panStart.x) * 0.5
      const dy = (e.clientY - panStart.y) * 0.5
      setViewBox(prev => ({
        ...prev,
        x: prev.x - dx,
        y: prev.y - dy
      }))
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    if (draggingStation) {
      // Check if this station is first or last in any line
      const affectedLines = lines.filter(line => {
        const stationIds = line.stations
        const firstId = stationIds[0]
        const lastId = stationIds[stationIds.length - 1]
        return draggingStation.id === firstId || draggingStation.id === lastId
      })
      
      // Check if dragged on top of the opposite end station
      for (const line of affectedLines) {
        const stationIds = line.stations
        const firstId = stationIds[0]
        const lastId = stationIds[stationIds.length - 1]
        
        // Skip if already a loop
        if (firstId === lastId) continue
        
        // Make sure we're not comparing the same station
        if (firstId === lastId) continue
        
        const firstStation = stations.find(s => s.id === firstId)
        const lastStation = stations.find(s => s.id === lastId)
        
        // Make sure both stations exist and are different
        if (!firstStation || !lastStation || firstStation.id === lastStation.id) continue
        
        // Check if first and last stations are now at the same position
        const distance = Math.sqrt(
          Math.pow(firstStation.x - lastStation.x, 2) + 
          Math.pow(firstStation.y - lastStation.y, 2)
        )
        
        if (distance < gridSpacing / 2) {
          // Show modal to choose which station to keep
          setLoopModalData({
            line,
            firstStation: { ...firstStation },
            lastStation: { ...lastStation },
            draggedStation: { ...draggingStation }
          })
          setShowLoopModal(true)
          return // Don't commit the drag yet
        }
      }
      
      // Normal drag completion - commit the changes to history
      setStations([...stations])
      setStationBeforeDrag(null)
    }
    setIsPanning(false)
    setDraggingStation(null)
  }

  const handleLoopModalChoice = (choice) => {
    if (!loopModalData) return
    
    const { line, firstStation, lastStation, draggedStation } = loopModalData
    
    if (choice === 'cancel') {
      // Revert to original position using setStationsNoHistory to avoid creating history entry
      if (stationBeforeDrag) {
        setStationsNoHistory(prev => prev.map(s => 
          s.id === draggedStation.id ? stationBeforeDrag : s
        ))
      }
    } else {
      // Keep the chosen station, remove the other, and create loop
      const stationToKeep = choice === 'first' ? firstStation : lastStation
      const stationToRemove = choice === 'first' ? lastStation : firstStation
      
      // Update the line to create a loop by replacing the removed station with the kept one
      const updatedLines = lines.map(l => {
        if (l.id === line.id) {
          const newStations = l.stations.map(id => 
            id === stationToRemove.id ? stationToKeep.id : id
          )
          return { ...l, stations: newStations }
        }
        return l
      })
      
      // Remove the duplicate station in one atomic operation
      const updatedStations = stations.filter(s => s.id !== stationToRemove.id)
      
      // Update both stations and lines together in one history entry
      if (setStationsAndLines) {
        setStationsAndLines(updatedStations, updatedLines)
      } else {
        // Fallback if combined function not available
        setStations(updatedStations)
        setLines(updatedLines)
      }
    }
    
    setShowLoopModal(false)
    setLoopModalData(null)
    setStationBeforeDrag(null)
    setDraggingStation(null)
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
    if (currentTool === 'createLine' && lineCreationStations.length >= 2) {
      finishLineCreation()
    } else if (currentTool === 'drawPath' && pathCreationPoints.length >= 2) {
      finishPathCreation()
    }
  }

  const finishLineCreation = (isLoop = false) => {
    if (lineCreationStations.length >= 2) {
      const newStations = [...stations, ...lineCreationStations]
      const stationIds = lineCreationStations.map(s => s.id)
      
      // Add first station again at the end for loop lines
      if (isLoop) {
        stationIds.push(lineCreationStations[0].id)
      }
      
      const newLine = {
        id: `line-${Date.now()}`,
        name: `Line ${lines.length + 1}`,
        stations: stationIds,
        color: currentLineColor,
        tension: 0.7
      }
      setStations(newStations)
      setLines([...lines, newLine])
      setLineCreationStations([])
      setCurrentLineColor(getLineColors())
      
      // Switch to select tool after finishing
      if (setCurrentTool) {
        setCurrentTool('select')
      }
    }
  }

  const finishPathCreation = () => {
    if (pathCreationPoints.length >= 2) {
      // Create line without stations - just the path points
      const newLine = {
        id: `line-${Date.now()}`,
        name: `Line ${lines.length + 1}`,
        stations: [], // No stations for path-only lines
        pathPoints: pathCreationPoints, // Store the path points
        color: currentLineColor,
        tension: 0.7
      }
      
      setLines([...lines, newLine])
      setPathCreationPoints([])
      setCurrentLineColor(getLineColors())
      
      // Switch to select tool after finishing
      if (setCurrentTool) {
        setCurrentTool('select')
      }
    }
  }

  const handleCenterView = (animate = true) => {
    if (stations.length === 0) return
    
    const xs = stations.map(s => s.x)
    const ys = stations.map(s => s.y)
    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2
    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2
    
    const targetX = centerX - viewBox.width / 2
    const targetY = centerY - viewBox.height / 2
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    if (!animate) {
      setViewBox(prev => ({
        ...prev,
        x: targetX,
        y: targetY
      }))
      return
    }
    
    setIsAnimating(true)
    const startX = viewBox.x
    const startY = viewBox.y
    const startTime = performance.now()
    const duration = 600
    
    const animateView = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const easeInOutCubic = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2
      
      const newX = startX + (targetX - startX) * easeInOutCubic
      const newY = startY + (targetY - startY) * easeInOutCubic
      
      setViewBox(prev => ({
        ...prev,
        x: newX,
        y: newY
      }))
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateView)
      } else {
        setIsAnimating(false)
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(animateView)
  }

  useImperativeHandle(ref, () => ({
    centerView: handleCenterView
  }))

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const renderGhostLine = () => {
    if (currentTool === 'createLine' && lineCreationStations.length > 0 && hoverGridPoint) {
      const points = [...lineCreationStations, hoverGridPoint]
      
      return (
        <TrainLine
          line={{ stations: [], color: currentLineColor }}
          stations={[]}
          lineStyle={lineStyle}
          isGhost={true}
          ghostPoints={points}
          color={currentLineColor}
          lineThickness={lineThickness}
        />
      )
    }
    
    if (currentTool === 'drawPath' && pathCreationPoints.length > 0 && hoverGridPoint) {
      const points = [...pathCreationPoints, hoverGridPoint]
      
      return (
        <TrainLine
          line={{ stations: [], color: currentLineColor }}
          stations={[]}
          lineStyle={lineStyle}
          isGhost={true}
          ghostPoints={points}
          color={currentLineColor}
          lineThickness={lineThickness}
        />
      )
    }
    
    return null
  }

  const getStationDisplayName = (station, stationIndex, lineIndex) => {
    if (!showStationNumbers) return station.name
    
    const linePrefix = getLinePrefix(lineIndex)
    if (linePrefix) {
      // If there are 2 or more lines, display without colon (e.g., "A1")
      if (lines.length >= 2) {
        return `${linePrefix}${stationIndex + 1} ${station.name}`
      }
      // If only 1 line, display with colon (e.g., "A1: Station Name")
      return `${linePrefix}${stationIndex + 1}: ${station.name}`
    }
    
    return `${stationIndex + 1}. ${station.name}`
  }

  const allDisplayStations = [...stations, ...lineCreationStations]

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-50 dark:bg-gray-800">
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="w-full h-full cursor-crosshair"
        preserveAspectRatio="xMidYMid slice"
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <GridCanvas spacing={gridSpacing} viewBox={viewBox} zoom={gridZoom} currentTool={currentTool} hoverPoint={hoverGridPoint} gridStyle={gridStyle} gridThickness={gridThickness} gridOpacity={gridOpacity} />
        
        {lines.map((line, lineIndex) => (
          <TrainLine
            key={line.id}
            line={line}
            stations={stations}
            lineStyle={lineStyle}
            onClick={(e) => handleLineClick(line, e)}
            isEditing={editingLine?.id === line.id}
            lineThickness={lineThickness}
          />
        ))}
        
        {renderGhostLine()}
        
        {pathCreationPoints.map((point, i) => (
          <circle
            key={`path-point-${i}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={currentLineColor}
            opacity="0.7"
          />
        ))}
        
        {stations.map((station, index) => {
          const stationLine = lines.find(line => line.stations.includes(station.id))
          const lineIndex = stationLine ? lines.indexOf(stationLine) : 0
          const stationIndexInLine = stationLine ? stationLine.stations.indexOf(station.id) : index
          
          // Check if this is the first station and can complete a loop
          const canCompleteLoop = currentTool === 'createLine' && 
            lineCreationStations.length >= 2 && 
            lineCreationStations[0].id === station.id
          
          return (
            <StationMarker
              key={station.id}
              station={{
                ...station,
                name: getStationDisplayName(station, stationIndexInLine, lineIndex)
              }}
              isSelected={selectedStations.some(s => s.id === station.id)}
              isDragging={draggingStation?.id === station.id}
              isHighlighted={selectedStationId === station.id || canCompleteLoop}
              isPlaying={playingStationId === station.id && isStationPlaying}
              onClick={(e) => {
                if (currentTool === 'createLine') {
                  handleLineCreationStationClick(station, e)
                } else if (currentTool === 'drawPath') {
                  handlePathCreationStationClick(station, e)
                } else {
                  handleStationClick(station, e)
                }
              }}
              onMouseDown={(e) => handleStationMouseDown(station, e)}
              onTouchStart={(e) => handleStationTouchStart(station, e)}
              allStations={allDisplayStations}
              labelSize={labelSize}
              markerSize={markerSize}
            />
          )
        })}
        
        {lineCreationStations.map((station, index) => (
          <StationMarker
            key={station.id}
            station={{
              ...station,
              name: getStationDisplayName(station, index, lines.length)
            }}
            isSelected={false}
            isDragging={false}
            onClick={() => {}}
            onMouseDown={() => {}}
            onTouchStart={() => {}}
            allStations={allDisplayStations}
            labelSize={labelSize}
            markerSize={markerSize}
          />
        ))}
      </svg>

      {(editingStation || editingLine) && (
        <LineStationEditor
          station={editingStation}
          line={editingLine}
          lines={lines}
          stations={stations}
          onUpdateStation={handleStationUpdate}
          onUpdateLine={handleLineUpdate}
          onDeleteStation={handleStationDelete}
          onDeleteLine={handleLineDelete}
          setStationsAndLines={setStationsAndLines}
          onClose={() => {
            setEditingStation(null)
            setEditingLine(null)
          }}
          language={language}
        />
      )}

      {/* Transit System Name */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {transitSystemName}
          </div>
        </div>
      </div>

      {lines.length > 0 && (
        <div className="absolute top-16 left-4 flex flex-col gap-2 items-start">
          {lines.map((line) => {
            const isSelected = selectedLineId === line.id && lines.length > 1
            
            // Add line breaks every 32 characters
            const formatLineName = (name) => {
              if (name.length <= 32) return name
              
              const words = name.split(' ')
              const lines = []
              let currentLine = ''
              
              for (const word of words) {
                if ((currentLine + ' ' + word).trim().length > 32) {
                  if (currentLine) lines.push(currentLine.trim())
                  currentLine = word
                } else {
                  currentLine = currentLine ? currentLine + ' ' + word : word
                }
              }
              if (currentLine) lines.push(currentLine.trim())
              
              return lines.join('\n')
            }
            
            return (
              <button
              key={line.id}
                onClick={() => {
                  if (editingLine?.id === line.id) {
                    setEditingLine(null)
                  } else {
                    setEditingLine(line)
                    setEditingStation(null)
                  }
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                  isSelected 
                    ? 'bg-white dark:bg-gray-800 border border-blue-500' 
                    : 'bg-white dark:bg-gray-800 border border-transparent'
                }`}
            >
              <GitCommitVertical 
                size={16} 
                style={{ color: line.color }}
                className="flex-shrink-0"
              />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {formatLineName(t(line.name))}
              </span>
              </button>
            )
          })}
        </div>
      )}

      {showTranscription && currentTranscription && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 relative">
            <div className="absolute top-3 left-3 flex items-center gap-1 px-1.5 py-0.5 bg-blue-500 text-white rounded">
              <SoundWave />
            </div>
            <p className="text-center text-base font-medium text-gray-800 dark:text-gray-200 px-8">
              {currentTranscription}
            </p>
          </div>
        </div>
      )}

      {/* Tooltip at top center */}
      {(currentTool === 'station' || currentTool === 'createLine' || currentTool === 'drawPath') && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <Info size={14} className="flex-shrink-0" />
            <span>
              {currentTool === 'station' && t('clickGridToAddStation')}
              {currentTool === 'createLine' && lineCreationStations.length === 0 && (isMobile ? t('tapToAddStations') : t('clickToAddStations'))}
              {currentTool === 'createLine' && lineCreationStations.length > 0 && lineCreationStations.length < 2 && 'Add more stations or right-click to finish'}
              {currentTool === 'createLine' && lineCreationStations.length >= 2 && 'Click first station to create loop, or right-click to finish'}
              {currentTool === 'drawPath' && (isMobile ? t('tapToDrawPath') : t('clickToDrawPath'))}
            </span>
          </div>
        </div>
      )}

      {/* Action buttons at bottom left */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-3 items-start">
        {/* Line Style Controls */}
        {showCanvasStyle && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">{t('lineStyle')}</span>
            <div 
              className="flex gap-0 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-md"
              style={{ backgroundColor: 'var(--toolbar-group-bg)' }}
            >
              <button
                onClick={() => onLineStyleChange('direct')}
                className={`flex items-center justify-center w-10 h-10 transition-colors ${
                  lineStyle === 'direct' ? 'btn-selected' : 'btn-unselected'
                }`}
                title={t('lineStyleDirect')}
              >
                <span className="text-lg font-medium">─</span>
              </button>
              <button
                onClick={() => onLineStyleChange('minimal')}
                className={`flex items-center justify-center w-10 h-10 transition-colors ${
                  lineStyle === 'minimal' ? 'btn-selected' : 'btn-unselected'
                }`}
                title={t('lineStyleMinimal')}
              >
                <i className="ri-loader-5-fill text-lg"></i>
              </button>
              <button
                onClick={() => onLineStyleChange('smooth')}
                className={`flex items-center justify-center w-10 h-10 transition-colors ${
                  lineStyle === 'smooth' ? 'btn-selected' : 'btn-unselected'
                }`}
                title={t('lineStyleSmooth')}
              >
                <span className="text-xl">∿</span>
              </button>
            </div>
          </div>
        )}

        {/* Grid Style Controls */}
        {showCanvasStyle && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">{t('gridStyle')}</span>
            <div 
              className="flex gap-0 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-md"
              style={{ backgroundColor: 'var(--toolbar-group-bg)' }}
            >
              <button
                onClick={() => onGridStyleChange('none')}
                className={`flex items-center justify-center w-10 h-10 transition-colors ${
                  gridStyle === 'none' ? 'btn-selected' : 'btn-unselected'
                }`}
                title={t('gridStyleNone')}
              >
                <EyeOff size={18} />
              </button>
              <button
                onClick={() => onGridStyleChange('dots')}
                className={`flex items-center justify-center w-10 h-10 transition-colors ${
                  gridStyle === 'dots' ? 'btn-selected' : 'btn-unselected'
                }`}
                title={t('gridStyleDots')}
              >
                <Dot size={18} />
              </button>
              <button
                onClick={() => onGridStyleChange('horizontal')}
                className={`flex items-center justify-center w-10 h-10 transition-colors ${
                  gridStyle === 'horizontal' ? 'btn-selected' : 'btn-unselected'
                }`}
                title={t('gridStyleHorizontal')}
              >
                <Minus size={18} />
              </button>
              <button
                onClick={() => onGridStyleChange('vertical')}
                className={`flex items-center justify-center w-10 h-10 transition-colors ${
                  gridStyle === 'vertical' ? 'btn-selected' : 'btn-unselected'
                }`}
                title={t('gridStyleVertical')}
              >
                <Minus size={18} style={{ transform: 'rotate(90deg)' }} />
              </button>
              <button
                onClick={() => onGridStyleChange('diagonal')}
                className={`flex items-center justify-center w-10 h-10 transition-colors ${
                  gridStyle === 'diagonal' ? 'btn-selected' : 'btn-unselected'
                }`}
                title={t('gridStyleDiagonal')}
              >
                <X size={18} />
              </button>
              <button
                onClick={() => onGridStyleChange('grid')}
                className={`flex items-center justify-center w-10 h-10 transition-colors ${
                  gridStyle === 'grid' ? 'btn-selected' : 'btn-unselected'
                }`}
                title={t('gridStyleGrid')}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Canvas Settings Controls */}
        {showCanvasStyle && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">{t('canvasSettings')}</span>
            
            {/* Marker Size */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Circle size={14} className="text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">{t('markerSize')}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5">
                <button
                  onClick={() => onMarkerSizeChange(Math.max(0.5, markerSize - 0.1))}
                  onMouseDown={markerSizeDecrease.startHold}
                  onMouseUp={markerSizeDecrease.stopHold}
                  onMouseLeave={markerSizeDecrease.stopHold}
                  onTouchStart={markerSizeDecrease.startHold}
                  onTouchEnd={markerSizeDecrease.stopHold}
                  className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Minus size={10} className="text-gray-700 dark:text-gray-300" />
                </button>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[2.5rem] text-center">
                  {markerSize.toFixed(1)}x
                </span>
                <button
                  onClick={() => onMarkerSizeChange(Math.min(5, markerSize + 0.1))}
                  onMouseDown={markerSizeIncrease.startHold}
                  onMouseUp={markerSizeIncrease.stopHold}
                  onMouseLeave={markerSizeIncrease.stopHold}
                  onTouchStart={markerSizeIncrease.startHold}
                  onTouchEnd={markerSizeIncrease.stopHold}
                  className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Plus size={10} className="text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Label Size */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Type size={14} className="text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">{t('labelSize')}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5">
                <button
                  onClick={() => onLabelSizeChange(Math.max(0.5, labelSize - 0.1))}
                  onMouseDown={labelSizeDecrease.startHold}
                  onMouseUp={labelSizeDecrease.stopHold}
                  onMouseLeave={labelSizeDecrease.stopHold}
                  onTouchStart={labelSizeDecrease.startHold}
                  onTouchEnd={labelSizeDecrease.stopHold}
                  className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Minus size={10} className="text-gray-700 dark:text-gray-300" />
                </button>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[2.5rem] text-center">
                  {labelSize.toFixed(1)}x
                </span>
                <button
                  onClick={() => onLabelSizeChange(Math.min(2, labelSize + 0.1))}
                  onMouseDown={labelSizeIncrease.startHold}
                  onMouseUp={labelSizeIncrease.stopHold}
                  onMouseLeave={labelSizeIncrease.stopHold}
                  onTouchStart={labelSizeIncrease.startHold}
                  onTouchEnd={labelSizeIncrease.stopHold}
                  className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Plus size={10} className="text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Line Thickness */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <LineIcon size={14} className="text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">{t('lineThickness')}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5">
                <button
                  onClick={() => onLineThicknessChange(Math.max(0.5, lineThickness - 0.1))}
                  onMouseDown={lineThicknessDecrease.startHold}
                  onMouseUp={lineThicknessDecrease.stopHold}
                  onMouseLeave={lineThicknessDecrease.stopHold}
                  onTouchStart={lineThicknessDecrease.startHold}
                  onTouchEnd={lineThicknessDecrease.stopHold}
                  className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Minus size={10} className="text-gray-700 dark:text-gray-300" />
                </button>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[2.5rem] text-center">
                  {lineThickness.toFixed(1)}x
                </span>
                <button
                  onClick={() => onLineThicknessChange(Math.min(5, lineThickness + 0.1))}
                  onMouseDown={lineThicknessIncrease.startHold}
                  onMouseUp={lineThicknessIncrease.stopHold}
                  onMouseLeave={lineThicknessIncrease.stopHold}
                  onTouchStart={lineThicknessIncrease.startHold}
                  onTouchEnd={lineThicknessIncrease.stopHold}
                  className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Plus size={10} className="text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Grid Thickness */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Grid3x3 size={14} className="text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">{t('gridThickness')}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5">
                <button
                  onClick={() => onGridThicknessChange(Math.max(0.5, gridThickness - 0.1))}
                  onMouseDown={gridThicknessDecrease.startHold}
                  onMouseUp={gridThicknessDecrease.stopHold}
                  onMouseLeave={gridThicknessDecrease.stopHold}
                  onTouchStart={gridThicknessDecrease.startHold}
                  onTouchEnd={gridThicknessDecrease.stopHold}
                  className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Minus size={10} className="text-gray-700 dark:text-gray-300" />
                </button>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[2.5rem] text-center">
                  {gridThickness.toFixed(1)}x
                </span>
                <button
                  onClick={() => onGridThicknessChange(Math.min(5, gridThickness + 0.1))}
                  onMouseDown={gridThicknessIncrease.startHold}
                  onMouseUp={gridThicknessIncrease.stopHold}
                  onMouseLeave={gridThicknessIncrease.stopHold}
                  onTouchStart={gridThicknessIncrease.startHold}
                  onTouchEnd={gridThicknessIncrease.stopHold}
                  className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Plus size={10} className="text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Grid Opacity */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">{t('gridOpacity')}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5">
                <button
                  onClick={() => onGridOpacityChange(Math.max(0.1, gridOpacity - 0.1))}
                  onMouseDown={gridOpacityDecrease.startHold}
                  onMouseUp={gridOpacityDecrease.stopHold}
                  onMouseLeave={gridOpacityDecrease.stopHold}
                  onTouchStart={gridOpacityDecrease.startHold}
                  onTouchEnd={gridOpacityDecrease.stopHold}
                  className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Minus size={10} className="text-gray-700 dark:text-gray-300" />
                </button>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[2.5rem] text-center">
                  {gridOpacity.toFixed(1)}x
                </span>
                <button
                  onClick={() => onGridOpacityChange(Math.min(1, gridOpacity + 0.1))}
                  onMouseDown={gridOpacityIncrease.startHold}
                  onMouseUp={gridOpacityIncrease.stopHold}
                  onMouseLeave={gridOpacityIncrease.stopHold}
                  onTouchStart={gridOpacityIncrease.startHold}
                  onTouchEnd={gridOpacityIncrease.stopHold}
                  className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Plus size={10} className="text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Canvas Style Toggle */}
        <button
          onClick={() => setShowCanvasStyle(!showCanvasStyle)}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
        >
          <Fullscreen size={16} />
          <span className="font-medium">{t('canvasStyle')}</span>
          {showCanvasStyle ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Center View and Zoom Controls */}
        <div className="flex gap-3 items-center">
        <button
          onClick={handleCenterView}
          disabled={stations.length === 0}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700"
        >
            <ScanEye size={16} />
          <span>{t('centerView')}</span>
        </button>

          <div className="flex gap-0 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
          <button
              onClick={() => handleZoomChange(gridZoom - 0.15)}
              onMouseDown={() => startZoomHold(-1)}
              onMouseUp={stopZoomHold}
              onMouseLeave={stopZoomHold}
              onTouchStart={() => startZoomHold(-1)}
              onTouchEnd={stopZoomHold}
              className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={`${t('zoomOut')} (${t('shiftScroll')})`}
            >
              <ZoomOut size={16} />
          </button>
            <button
              onClick={() => handleZoomChange(gridZoom + 0.15)}
              onMouseDown={() => startZoomHold(1)}
              onMouseUp={stopZoomHold}
              onMouseLeave={stopZoomHold}
              onTouchStart={() => startZoomHold(1)}
              onTouchEnd={stopZoomHold}
              className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={`${t('zoomIn')} (${t('shiftScroll')})`}
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
        
        {(currentTool === 'createLine' && lineCreationStations.length >= 2) && (
          <button
            onClick={finishLineCreation}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md text-sm hover:bg-green-600 transition-colors border border-green-500"
          >
            <CheckCircle size={16} />
            <span>{t('finishLine')}</span>
          </button>
        )}
        
        {(currentTool === 'drawPath' && pathCreationPoints.length >= 2) && (
          <button
            onClick={finishPathCreation}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md text-sm hover:bg-green-600 transition-colors border border-green-500"
          >
            <CheckCircle size={16} />
            <span>{t('finishLine')}</span>
          </button>
        )}
      </div>

      {/* Loop Station Choice Modal */}
      {showLoopModal && loopModalData && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-md w-full mx-4">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-2">
              {t('createLoopLine')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('selectLoopStation')}
            </p>
            
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => handleLoopModalChoice('first')}
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: loopModalData.line.color }}
                    />
                    <span className="font-medium text-sm">{loopModalData.firstStation.name}</span>
        </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{t('firstStation')}</span>
      </div>
              </button>
              
              <button
                onClick={() => handleLoopModalChoice('last')}
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: loopModalData.line.color }}
                    />
                    <span className="font-medium text-sm">{loopModalData.lastStation.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{t('lastStation')}</span>
                </div>
              </button>
            </div>
            
            <button
              onClick={() => handleLoopModalChoice('cancel')}
              className="w-full px-3 py-2 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-lg transition-colors text-sm border border-gray-300 dark:border-gray-600"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

MapEditor.displayName = 'MapEditor'

export default MapEditor
