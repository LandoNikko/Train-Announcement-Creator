import { useRef, useState } from 'react'
import GridCanvas from './GridCanvas'
import StationMarker from './StationMarker'
import TrainLine from './TrainLine'
import StationEditor from './StationEditor'

const MapEditor = ({ 
  stations, 
  setStations, 
  lines, 
  setLines, 
  currentTool,
  selectedStations,
  setSelectedStations 
}) => {
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [editingStation, setEditingStation] = useState(null)
  const svgRef = useRef(null)
  
  const gridSpacing = 30
  const snapToGrid = (coord) => Math.round(coord / gridSpacing) * gridSpacing

  const getSVGPoint = (clientX, clientY) => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const pt = svgRef.current.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM().inverse())
    return { x: svgP.x, y: svgP.y }
  }

  const handleCanvasClick = (e) => {
    if (currentTool !== 'station') return
    
    if (e.target.tagName === 'circle' && e.target.getAttribute('class')?.includes('grid-dot')) {
      const cx = parseFloat(e.target.getAttribute('cx'))
      const cy = parseFloat(e.target.getAttribute('cy'))
      
      const newStation = {
        id: `station-${Date.now()}`,
        x: cx,
        y: cy,
        name: `Station ${stations.length + 1}`,
        color: '#3b82f6'
      }
      setStations([...stations, newStation])
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

  const handleStationUpdate = (updatedStation) => {
    setStations(stations.map(s => s.id === updatedStation.id ? updatedStation : s))
    setEditingStation(null)
  }

  const handleStationDelete = (stationId) => {
    setStations(stations.filter(s => s.id !== stationId))
    setLines(lines.filter(l => !l.stations.includes(stationId)))
    setEditingStation(null)
  }

  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
      e.preventDefault()
    }
  }

  const handleMouseMove = (e) => {
    if (isPanning) {
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
    setIsPanning(false)
  }

  return (
    <div className="relative w-full h-full bg-gray-100">
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="w-full h-full cursor-crosshair"
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <GridCanvas spacing={gridSpacing} viewBox={viewBox} />
        
        {lines.map(line => (
          <TrainLine
            key={line.id}
            line={line}
            stations={stations}
          />
        ))}
        
        {stations.map(station => (
          <StationMarker
            key={station.id}
            station={station}
            isSelected={selectedStations.some(s => s.id === station.id)}
            onClick={(e) => handleStationClick(station, e)}
          />
        ))}
      </svg>

      {editingStation && (
        <StationEditor
          station={editingStation}
          onUpdate={handleStationUpdate}
          onDelete={handleStationDelete}
          onClose={() => setEditingStation(null)}
        />
      )}

      <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md text-sm text-gray-600">
        {currentTool === 'station' && 'Click on grid to add station'}
        {currentTool === 'line' && selectedStations.length === 0 && 'Click stations to connect them'}
        {currentTool === 'line' && selectedStations.length === 1 && 'Click another station to complete line'}
        {currentTool === 'select' && 'Click station to edit'}
      </div>
    </div>
  )
}

export default MapEditor
