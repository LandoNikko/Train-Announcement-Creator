import { useRef, useState, useEffect } from 'react'
import { Crosshair } from 'lucide-react'
import GridCanvas from './GridCanvas'
import StationMarker from './StationMarker'
import TrainLine from './TrainLine'
import StationEditor from './StationEditor'
import { useTranslation } from '../../hooks/useTranslation'

const MapEditor = ({ 
  stations, 
  setStations, 
  setStationsNoHistory,
  lines, 
  setLines, 
  currentTool,
  selectedStations,
  setSelectedStations,
  gridZoom = 1,
  language = 'en',
  lineStyle = 'smooth'
}) => {
  const { t } = useTranslation(language)
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [editingStation, setEditingStation] = useState(null)
  const [draggingStation, setDraggingStation] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  
  const gridSpacing = 30 * gridZoom
  const snapToGrid = (coord) => Math.round(coord / gridSpacing) * gridSpacing

  // Update station positions when zoom changes (without saving to history)
  useEffect(() => {
    const updatedStations = stations.map(station => {
      if (station.gridIndexX !== undefined && station.gridIndexY !== undefined) {
        return {
          ...station,
          x: station.gridIndexX * gridSpacing,
          y: station.gridIndexY * gridSpacing
        }
      }
      return station
    })
    setStationsNoHistory(updatedStations)
  }, [gridZoom])

  // Handle window resize to update viewBox dimensions
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

  const getSVGPoint = (clientX, clientY) => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const pt = svgRef.current.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM().inverse())
    return { x: svgP.x, y: svgP.y }
  }

  const handleCanvasClick = (e) => {
    // Station tool - add new station
    if (currentTool === 'station') {
      // Smart grid point detection - snap to nearest grid point
      if (e.target.tagName === 'circle' && e.target.classList.contains('grid-dot')) {
        const cx = parseFloat(e.target.getAttribute('cx'))
        const cy = parseFloat(e.target.getAttribute('cy'))
        
        // Store grid indices for zoom scaling
        const gridIndexX = Math.round(cx / gridSpacing)
        const gridIndexY = Math.round(cy / gridSpacing)
        
        const newStation = {
          id: `station-${Date.now()}`,
          gridIndexX,
          gridIndexY,
          x: cx,
          y: cy,
          name: `${t('station')} ${stations.length + 1}`,
          color: '#3b82f6'
        }
        setStations([...stations, newStation])
      } else if (e.target.tagName === 'rect' || e.target === svgRef.current) {
        // Clicked on background - find nearest grid point
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
          name: `${t('station')} ${stations.length + 1}`,
          color: '#3b82f6'
        }
        setStations([...stations, newStation])
      }
    }
    // Line tool - find nearest station and connect
    else if (currentTool === 'line' && (e.target.tagName === 'rect' || e.target === svgRef.current || e.target.tagName === 'circle')) {
      const svgPoint = getSVGPoint(e.clientX, e.clientY)
      
      // Find nearest station
      let nearestStation = null
      let minDistance = Infinity
      
      stations.forEach(station => {
        const distance = Math.sqrt(
          Math.pow(station.x - svgPoint.x, 2) + Math.pow(station.y - svgPoint.y, 2)
        )
        if (distance < minDistance && distance < gridSpacing * 2) {
          minDistance = distance
          nearestStation = station
        }
      })
      
      if (nearestStation && !selectedStations.find(s => s.id === nearestStation.id)) {
        const newSelected = [...selectedStations, nearestStation]
        setSelectedStations(newSelected)
        
        if (newSelected.length >= 2) {
          const newLine = {
            id: `line-${Date.now()}`,
            name: `Line ${lines.length + 1}`,
            stations: newSelected.map(s => s.id),
            color: '#ef4444',
            tension: 0.7
          }
          setLines([...lines, newLine])
          setSelectedStations([])
        }
      }
    }
  }

  const handleStationClick = (station, e) => {
    e.stopPropagation()
    
    if (currentTool === 'select') {
      setEditingStation(station)
    } else if (currentTool === 'line') {
      if (!selectedStations.find(s => s.id === station.id)) {
        const newSelected = [...selectedStations, station]
        setSelectedStations(newSelected)
        
        if (newSelected.length >= 2) {
          const newLine = {
            id: `line-${Date.now()}`,
            name: `Line ${lines.length + 1}`,
            stations: newSelected.map(s => s.id),
            color: '#ef4444',
            tension: 0.7
          }
          setLines([...lines, newLine])
          setSelectedStations([])
        }
      }
    }
  }

  const handleStationMouseDown = (station, e) => {
    if (currentTool === 'select') {
      e.stopPropagation()
      const svgPoint = getSVGPoint(e.clientX, e.clientY)
      setDraggingStation(station)
      setEditingStation(null) // Close edit station when starting drag
      setDragOffset({
        x: svgPoint.x - station.x,
        y: svgPoint.y - station.y
      })
    }
  }

  const handleStationUpdate = (updatedStation) => {
    setStations(stations.map(s => s.id === updatedStation.id ? updatedStation : s))
  }

  const handleStationDelete = (stationId) => {
    setStations(stations.filter(s => s.id !== stationId))
    
    // Update lines to remove the deleted station, keep lines with 2+ remaining stations
    const updatedLines = lines.map(line => ({
      ...line,
      stations: line.stations.filter(id => id !== stationId)
    })).filter(line => line.stations.length >= 2)
    
    setLines(updatedLines)
    setEditingStation(null)
  }

  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
      setEditingStation(null) // Close edit station when panning
      e.preventDefault()
    }
  }

  const handleMouseMove = (e) => {
    if (draggingStation) {
      const svgPoint = getSVGPoint(e.clientX, e.clientY)
      const newX = snapToGrid(svgPoint.x - dragOffset.x)
      const newY = snapToGrid(svgPoint.y - dragOffset.y)
      
      // Use no-history version during drag for performance and to avoid multiple history entries
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
    // Save to history when finishing a drag operation
    if (draggingStation) {
      // Use wrapped version to save current state to history
      setStations(stations)
    }
    setIsPanning(false)
    setDraggingStation(null)
  }

  const handleCenterView = () => {
    if (stations.length === 0) return
    
    // Calculate center point of all stations
    const xs = stations.map(s => s.x)
    const ys = stations.map(s => s.y)
    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2
    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2
    
    // Keep current zoom level, just center the view
    setViewBox(prev => ({
      ...prev,
      x: centerX - prev.width / 2,
      y: centerY - prev.height / 2
    }))
  }

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
      >
        <GridCanvas spacing={gridSpacing} viewBox={viewBox} zoom={gridZoom} />
        
        {lines.map(line => (
          <TrainLine
            key={line.id}
            line={line}
            stations={stations}
            lineStyle={lineStyle}
          />
        ))}
        
        {stations.map(station => (
          <StationMarker
            key={station.id}
            station={station}
            isSelected={selectedStations.some(s => s.id === station.id)}
            isDragging={draggingStation?.id === station.id}
            onClick={(e) => handleStationClick(station, e)}
            onMouseDown={(e) => handleStationMouseDown(station, e)}
            allStations={stations}
          />
        ))}
      </svg>

      {editingStation && (
        <StationEditor
          station={editingStation}
          onUpdate={handleStationUpdate}
          onDelete={handleStationDelete}
          onClose={() => setEditingStation(null)}
          language={language}
        />
      )}

      <div className="absolute bottom-4 left-4 flex items-center gap-3">
        <button
          onClick={handleCenterView}
          disabled={stations.length === 0}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Crosshair size={16} />
          <span>{t('centerView')}</span>
        </button>
        
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md text-sm text-gray-600 dark:text-gray-300">
          {currentTool === 'station' && t('clickGridToAddStation')}
          {currentTool === 'line' && selectedStations.length === 0 && t('clickStationsToConnect')}
          {currentTool === 'line' && selectedStations.length === 1 && t('clickAnotherStation')}
        </div>
      </div>
    </div>
  )
}

export default MapEditor
