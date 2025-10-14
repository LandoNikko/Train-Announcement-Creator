const GridCanvas = ({ spacing, viewBox, zoom = 1, currentTool = 'select', hoverPoint = null }) => {
  const dots = []
  const startX = Math.floor(viewBox.x / spacing) * spacing
  const endX = Math.ceil((viewBox.x + viewBox.width) / spacing) * spacing
  const startY = Math.floor(viewBox.y / spacing) * spacing
  const endY = Math.ceil((viewBox.y + viewBox.height) / spacing) * spacing

  for (let x = startX; x <= endX; x += spacing) {
    for (let y = startY; y <= endY; y += spacing) {
      dots.push({ x, y, key: `${x}-${y}` })
    }
  }

  const dotRadius = Math.min(3.5, 2 * zoom)
  const showHoverIndicator = currentTool === 'station' || currentTool === 'createLine' || currentTool === 'drawPath'

  return (
    <g>
      <rect
        x={viewBox.x}
        y={viewBox.y}
        width={viewBox.width}
        height={viewBox.height}
        className="pointer-events-none fill-gray-50 dark:fill-gray-800"
      />
      {dots.map(dot => {
        const isHovered = showHoverIndicator && hoverPoint && 
          Math.abs(dot.x - hoverPoint.x) < 1 && 
          Math.abs(dot.y - hoverPoint.y) < 1
        
        return (
          <circle
            key={dot.key}
            cx={dot.x}
            cy={dot.y}
            r={isHovered ? dotRadius * 2 : dotRadius}
            className={`grid-dot transition-all ${
              showHoverIndicator ? 'cursor-pointer' : ''
            } ${
              isHovered 
                ? 'fill-blue-400 dark:fill-blue-500' 
                : showHoverIndicator
                  ? 'fill-gray-300 dark:fill-gray-600 hover:fill-blue-400 dark:hover:fill-blue-500'
                  : 'fill-gray-300 dark:fill-gray-600'
            }`}
          />
        )
      })}
      
      {showHoverIndicator && hoverPoint && (
        <circle
          cx={hoverPoint.x}
          cy={hoverPoint.y}
          r={dotRadius * 3}
          className="fill-blue-400 dark:fill-blue-500 pointer-events-none"
          opacity="0.3"
        />
      )}
    </g>
  )
}

export default GridCanvas
