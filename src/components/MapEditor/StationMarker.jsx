const StationMarker = ({ station, isSelected, isDragging, isHighlighted = false, isPlaying = false, onClick, onMouseDown, onTouchStart, allStations = [], labelSize = 1, markerSize = 1 }) => {
  const fontSize = 14 * labelSize
  const textPaddingX = 16 * labelSize
  const textPaddingY = 12 * labelSize
  const markerRadius = 8 * markerSize
  const labelOffset = 18 + (markerRadius - 8)
  
  const getTextWidth = (text) => {
    const avgCharWidth = fontSize * 0.55
    return text.length * avgCharWidth
  }
  
  const textWidth = getTextWidth(station.name)
  const rectWidth = textWidth + textPaddingX * 2
  const rectHeight = fontSize + textPaddingY
  
  const getOtherStationLabelBounds = (other, positionType = 'top') => {
    const otherWidth = getTextWidth(other.name) + textPaddingX * 2
    const otherHeight = rectHeight
    
    const positions = {
      top: { x: other.x - otherWidth / 2, y: other.y - labelOffset - otherHeight },
      bottom: { x: other.x - otherWidth / 2, y: other.y + labelOffset },
      left: { x: other.x - otherWidth - 15, y: other.y - otherHeight / 2 },
      right: { x: other.x + 15, y: other.y - otherHeight / 2 }
    }
    
    const pos = positions[positionType] || positions.top
    return { x: pos.x, y: pos.y, width: otherWidth, height: otherHeight }
  }
  
  const checkCollision = (x, y, width, height, currentPos) => {
    const buffer = 5
    return allStations.some(other => {
      if (other.id === station.id) return false
      
      // Try all possible positions for other stations
      const posTypes = ['top', 'bottom', 'left', 'right']
      return posTypes.some(posType => {
        const otherBounds = getOtherStationLabelBounds(other, posType)
        
        // Check if rectangles overlap with buffer
        return !(x + width + buffer < otherBounds.x ||
                 x - buffer > otherBounds.x + otherBounds.width ||
                 y + height + buffer < otherBounds.y ||
                 y - buffer > otherBounds.y + otherBounds.height)
      })
    })
  }
  
  // Try different label positions: top, bottom, left, right
  const positions = [
    { x: station.x - rectWidth / 2, y: station.y - labelOffset - rectHeight, name: 'top' },
    { x: station.x - rectWidth / 2, y: station.y + labelOffset, name: 'bottom' },
    { x: station.x - rectWidth - 15, y: station.y - rectHeight / 2, name: 'left' },
    { x: station.x + 15, y: station.y - rectHeight / 2, name: 'right' }
  ]
  
  // For stations on same row, alternate top/bottom based on index
  const stationIndex = allStations.findIndex(s => s.id === station.id)
  const sameRowStations = allStations.filter(s => 
    Math.abs(s.y - station.y) < 10 && s.x !== station.x
  )
  
  if (sameRowStations.length > 0) {
    // Alternate between top and bottom for same-row stations
    const shouldUseBottom = stationIndex % 2 === 1
    positions[0] = shouldUseBottom ? positions[1] : positions[0]
    positions.splice(1, 1) // Remove the other option
  }
  
  // Find first non-colliding position
  let labelPos = positions[0]
  for (const pos of positions) {
    if (!checkCollision(pos.x, pos.y, rectWidth, rectHeight, pos.name)) {
      labelPos = pos
      break
    }
  }
  
  const rectX = labelPos.x
  const rectY = labelPos.y
  const textX = rectX + rectWidth / 2
  const textY = rectY + rectHeight / 2
  
  return (
    <g 
      onClick={onClick} 
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={isDragging ? "cursor-grabbing" : "cursor-pointer"}
    >
      {isHighlighted && (
        <circle
          cx={station.x}
          cy={station.y}
          r={16 * markerSize}
          fill="none"
          stroke="rgba(156, 163, 175, 0.6)"
          strokeWidth={3 * markerSize}
          opacity="0.8"
          className={isPlaying ? "animate-[pulse_1s_ease-in-out_infinite] dark:stroke-white/40" : "dark:stroke-white/40"}
        />
      )}
      <circle
        cx={station.x}
        cy={station.y}
        r={isDragging ? (10 * markerSize) : (8 * markerSize)}
        fill={isSelected ? '#fbbf24' : station.color}
        stroke={isHighlighted ? 'rgba(156, 163, 175, 0.8)' : 'white'}
        strokeWidth={isHighlighted ? (3 * markerSize) : (2 * markerSize)}
        className="hover:r-10 dark:[stroke:rgba(255,255,255,0.5)]"
      />
      <circle
        cx={station.x}
        cy={station.y}
        r={3 * markerSize}
        fill="white"
      />
      <rect
        x={rectX}
        y={rectY}
        width={rectWidth}
        height={rectHeight}
        rx={rectHeight / 2}
        className="fill-white dark:fill-gray-700 pointer-events-none"
        stroke={station.color}
        strokeWidth="1.5"
      />
      <text
        x={textX}
        y={textY}
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-semibold fill-gray-800 dark:fill-gray-200 pointer-events-none select-none"
        style={{ fontSize: `${fontSize}px` }}
      >
        {station.name}
      </text>
    </g>
  )
}

export default StationMarker
