import { useRef, useState, useEffect } from 'react'
import { Crosshair, CheckCircle } from 'lucide-react'
import GridCanvas from './GridCanvas'
import StationMarker from './StationMarker'
import TrainLine from './TrainLine'
import StationEditor from './StationEditor'
import { useTranslation } from '../../hooks/useTranslation'
import { getNextStationName } from '../../data/stationNames'

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
  lineStyle = 'smooth',
  showStationNumbers = false,
  isMobile = false,
  selectedStationId = null
}) => {
  const { t } = useTranslation(language)
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [editingStation, setEditingStation] = useState(null)
  const [draggingStation, setDraggingStation] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hoverGridPoint, setHoverGridPoint] = useState(null)
  const [mousePosition, setMousePosition] = useState(null)
  const [lineCreationStations, setLineCreationStations] = useState([])
  const [pathCreationPoints, setPathCreationPoints] = useState([])
  const [currentLineColor, setCurrentLineColor] = useState('#ef4444')
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  
  const gridSpacing = 30 * gridZoom
  const snapToGrid = (coord) => Math.round(coord / gridSpacing) * gridSpacing

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
        setStations([...stations, newStation])
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
        setStations([...stations, newStation])
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
    
    const updatedLines = lines.map(line => ({
      ...line,
      stations: line.stations.filter(id => id !== stationId)
    })).filter(line => line.stations.length >= 2)
    
    setLines(updatedLines)
    setEditingStation(null)
  }

  const handleMouseDown = (e) => {
    const canPan = e.button === 1 || (e.button === 0 && e.shiftKey) || (e.button === 0 && currentTool === 'select' && (e.target.tagName === 'rect' || e.target === svgRef.current))
    
    if (canPan) {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
      setEditingStation(null)
      e.preventDefault()
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
      setStations(stations)
    }
    setIsPanning(false)
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

  const finishLineCreation = () => {
    if (lineCreationStations.length >= 2) {
      const newStations = [...stations, ...lineCreationStations]
      const newLine = {
        id: `line-${Date.now()}`,
        name: `Line ${lines.length + 1}`,
        stations: lineCreationStations.map(s => s.id),
        color: currentLineColor,
        tension: 0.7
      }
      setStations(newStations)
      setLines([...lines, newLine])
      setLineCreationStations([])
      setCurrentLineColor(getLineColors())
    }
  }

  const finishPathCreation = () => {
    if (pathCreationPoints.length >= 2) {
      const numStations = Math.max(2, Math.floor(pathCreationPoints.length / 2) + 1)
      const newStations = []
      
      for (let i = 0; i < numStations; i++) {
        const t = i / (numStations - 1)
        const pointIndex = Math.floor(t * (pathCreationPoints.length - 1))
        const point = pathCreationPoints[pointIndex]
        
        newStations.push({
          id: `station-${Date.now()}-${i}`,
          gridIndexX: point.gridIndexX,
          gridIndexY: point.gridIndexY,
          x: point.x,
          y: point.y,
          name: getNextStationName([...stations, ...newStations], language),
          color: currentLineColor
        })
      }
      
      const allStations = [...stations, ...newStations]
      const newLine = {
        id: `line-${Date.now()}`,
        name: `Line ${lines.length + 1}`,
        stations: newStations.map(s => s.id),
        color: currentLineColor,
        tension: 0.7
      }
      
      setStations(allStations)
      setLines([...lines, newLine])
      setPathCreationPoints([])
      setCurrentLineColor(getLineColors())
    }
  }

  const handleCenterView = () => {
    if (stations.length === 0) return
    
    const xs = stations.map(s => s.x)
    const ys = stations.map(s => s.y)
    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2
    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2
    
    setViewBox(prev => ({
      ...prev,
      x: centerX - prev.width / 2,
      y: centerY - prev.height / 2
    }))
  }

  const renderGhostLine = () => {
    if (currentTool === 'createLine' && lineCreationStations.length > 0 && mousePosition) {
      const points = [...lineCreationStations, { x: mousePosition.x, y: mousePosition.y }]
      const pathData = points.map((p, i) => 
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
      ).join(' ')
      
      return (
        <path
          d={pathData}
          stroke={currentLineColor}
          strokeWidth="3"
          fill="none"
          strokeDasharray="5,5"
          opacity="0.5"
          pointerEvents="none"
        />
      )
    }
    
    if (currentTool === 'drawPath' && pathCreationPoints.length > 0 && mousePosition) {
      const points = [...pathCreationPoints, { x: mousePosition.x, y: mousePosition.y }]
      const pathData = points.map((p, i) => 
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
      ).join(' ')
      
      return (
        <path
          d={pathData}
          stroke={currentLineColor}
          strokeWidth="3"
          fill="none"
          strokeDasharray="5,5"
          opacity="0.5"
          pointerEvents="none"
        />
      )
    }
    
    return null
  }

  const getStationDisplayName = (station, stationIndex, lineIndex) => {
    if (!showStationNumbers) return station.name
    
    const linePrefix = getLinePrefix(lineIndex)
    if (linePrefix) {
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
      >
        <GridCanvas spacing={gridSpacing} viewBox={viewBox} zoom={gridZoom} currentTool={currentTool} hoverPoint={hoverGridPoint} />
        
        {lines.map((line, lineIndex) => (
          <TrainLine
            key={line.id}
            line={line}
            stations={stations}
            lineStyle={lineStyle}
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
          
          return (
            <StationMarker
              key={station.id}
              station={{
                ...station,
                name: getStationDisplayName(station, stationIndexInLine, lineIndex)
              }}
              isSelected={selectedStations.some(s => s.id === station.id)}
              isDragging={draggingStation?.id === station.id}
              isHighlighted={selectedStationId === station.id}
              onClick={(e) => handleStationClick(station, e)}
              onMouseDown={(e) => handleStationMouseDown(station, e)}
              allStations={allDisplayStations}
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
            allStations={allDisplayStations}
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
        
        {(currentTool === 'createLine' && lineCreationStations.length >= 2) && (
          <button
            onClick={finishLineCreation}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md text-sm hover:bg-green-600 transition-colors"
          >
            <CheckCircle size={16} />
            <span>{t('finishLine')}</span>
          </button>
        )}
        
        {(currentTool === 'drawPath' && pathCreationPoints.length >= 2) && (
          <button
            onClick={finishPathCreation}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md text-sm hover:bg-green-600 transition-colors"
          >
            <CheckCircle size={16} />
            <span>{t('finishLine')}</span>
          </button>
        )}
        
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md text-sm text-gray-600 dark:text-gray-300">
          {currentTool === 'station' && t('clickGridToAddStation')}
          {currentTool === 'createLine' && (isMobile ? t('tapToAddStations') : t('clickToAddStations'))}
          {currentTool === 'drawPath' && (isMobile ? t('tapToDrawPath') : t('clickToDrawPath'))}
        </div>
      </div>
    </div>
  )
}

export default MapEditor
