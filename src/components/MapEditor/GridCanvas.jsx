const GridCanvas = ({ spacing, viewBox, zoom = 1, currentTool = 'select', hoverPoint = null, gridStyle = 'dots', gridThickness = 1, gridOpacity = 1 }) => {
  const startX = Math.floor(viewBox.x / spacing) * spacing
  const endX = Math.ceil((viewBox.x + viewBox.width) / spacing) * spacing
  const startY = Math.floor(viewBox.y / spacing) * spacing
  const endY = Math.ceil((viewBox.y + viewBox.height) / spacing) * spacing

  const dotRadius = Math.min(3.5, 2 * zoom) * gridThickness
  const showHoverIndicator = currentTool === 'station' || currentTool === 'createLine' || currentTool === 'drawPath'

  const renderGrid = () => {
    if (gridStyle === 'none') {
      return null
    }
    
    if (gridStyle === 'dots') {
      const dots = []
      for (let x = startX; x <= endX; x += spacing) {
        for (let y = startY; y <= endY; y += spacing) {
          dots.push({ x, y, key: `${x}-${y}` })
        }
      }
      
      return dots.map(dot => {
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
            opacity={gridOpacity}
          />
        )
      })
    }
    
    if (gridStyle === 'horizontal') {
      const lines = []
      for (let y = startY; y <= endY; y += spacing) {
        lines.push(
          <line
            key={`h-${y}`}
            x1={viewBox.x}
            y1={y}
            x2={viewBox.x + viewBox.width}
            y2={y}
            className="stroke-gray-300 dark:stroke-gray-600"
            strokeWidth={Math.min(1, 0.5 * zoom) * gridThickness}
            opacity={gridOpacity}
          />
        )
      }
      return lines
    }
    
    if (gridStyle === 'vertical') {
      const lines = []
      for (let x = startX; x <= endX; x += spacing) {
        lines.push(
          <line
            key={`v-${x}`}
            x1={x}
            y1={viewBox.y}
            x2={x}
            y2={viewBox.y + viewBox.height}
            className="stroke-gray-300 dark:stroke-gray-600"
            strokeWidth={Math.min(1, 0.5 * zoom) * gridThickness}
            opacity={gridOpacity}
          />
        )
      }
      return lines
    }
    
    if (gridStyle === 'grid') {
      const lines = []
      // Horizontal lines
      for (let y = startY; y <= endY; y += spacing) {
        lines.push(
          <line
            key={`h-${y}`}
            x1={viewBox.x}
            y1={y}
            x2={viewBox.x + viewBox.width}
            y2={y}
            className="stroke-gray-300 dark:stroke-gray-600"
            strokeWidth={Math.min(1, 0.5 * zoom) * gridThickness}
            opacity={gridOpacity}
          />
        )
      }
      // Vertical lines
      for (let x = startX; x <= endX; x += spacing) {
        lines.push(
          <line
            key={`v-${x}`}
            x1={x}
            y1={viewBox.y}
            x2={x}
            y2={viewBox.y + viewBox.height}
            className="stroke-gray-300 dark:stroke-gray-600"
            strokeWidth={Math.min(1, 0.5 * zoom) * gridThickness}
            opacity={gridOpacity}
          />
        )
      }
      return lines
    }
    
    if (gridStyle === 'diagonal') {
      const lines = []
      const minX = viewBox.x - spacing
      const maxX = viewBox.x + viewBox.width + spacing
      const minY = viewBox.y - spacing
      const maxY = viewBox.y + viewBox.height + spacing
      
      // Diagonal lines (top-left to bottom-right: slope = 1)
      // For y = x + c, we need lines where c = y - x
      const minC = minY - maxX
      const maxC = maxY - minX
      const startC = Math.floor(minC / spacing) * spacing
      const endC = Math.ceil(maxC / spacing) * spacing
      
      for (let c = startC; c <= endC; c += spacing) {
        // Line equation: y = x + c
        // Find intersection with viewBox boundaries
        let x1 = Math.max(minX, minY - c)
        let y1 = x1 + c
        let x2 = Math.min(maxX, maxY - c)
        let y2 = x2 + c
        
        // Clamp to viewBox
        if (y1 < minY) { y1 = minY; x1 = y1 - c; }
        if (y1 > maxY) { y1 = maxY; x1 = y1 - c; }
        if (y2 < minY) { y2 = minY; x2 = y2 - c; }
        if (y2 > maxY) { y2 = maxY; x2 = y2 - c; }
        
        if (x1 <= maxX && x2 >= minX && y1 <= maxY && y2 >= minY) {
          lines.push(
            <line
              key={`d1-${c}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className="stroke-gray-300 dark:stroke-gray-600"
              strokeWidth={Math.min(1, 0.5 * zoom) * gridThickness}
              opacity={gridOpacity}
            />
          )
        }
      }
      
      // Diagonal lines (bottom-left to top-right: slope = -1)
      // For y = -x + c, we need lines where c = y + x
      const minC2 = minY + minX
      const maxC2 = maxY + maxX
      const startC2 = Math.floor(minC2 / spacing) * spacing
      const endC2 = Math.ceil(maxC2 / spacing) * spacing
      
      for (let c = startC2; c <= endC2; c += spacing) {
        // Line equation: y = -x + c
        // Find intersection with viewBox boundaries
        let x1 = Math.max(minX, c - maxY)
        let y1 = c - x1
        let x2 = Math.min(maxX, c - minY)
        let y2 = c - x2
        
        // Clamp to viewBox
        if (y1 < minY) { y1 = minY; x1 = c - y1; }
        if (y1 > maxY) { y1 = maxY; x1 = c - y1; }
        if (y2 < minY) { y2 = minY; x2 = c - y2; }
        if (y2 > maxY) { y2 = maxY; x2 = c - y2; }
        
        if (x1 <= maxX && x2 >= minX && y1 <= maxY && y2 >= minY) {
          lines.push(
            <line
              key={`d2-${c}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className="stroke-gray-300 dark:stroke-gray-600"
              strokeWidth={Math.min(1, 0.5 * zoom) * gridThickness}
              opacity={gridOpacity}
            />
          )
        }
      }
      
      return lines
    }
    
    return null
  }

  return (
    <g>
      <rect
        x={viewBox.x}
        y={viewBox.y}
        width={viewBox.width}
        height={viewBox.height}
        className="pointer-events-none"
        style={{ fill: 'var(--canvas-bg)' }}
      />
      {renderGrid()}
      
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
