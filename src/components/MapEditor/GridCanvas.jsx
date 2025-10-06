const GridCanvas = ({ spacing, viewBox, zoom = 1 }) => {
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

  // Scale dot radius with zoom (larger when zoomed in)
  const dotRadius = Math.min(5, 3 * zoom)

  return (
    <g>
      <rect
        x={viewBox.x}
        y={viewBox.y}
        width={viewBox.width}
        height={viewBox.height}
        className="pointer-events-none fill-gray-50 dark:fill-gray-800"
      />
      {dots.map(dot => (
        <circle
          key={dot.key}
          cx={dot.x}
          cy={dot.y}
          r={dotRadius}
          className="grid-dot cursor-pointer fill-gray-300 dark:fill-gray-600 hover:fill-blue-400 dark:hover:fill-blue-500 transition-colors"
        />
      ))}
    </g>
  )
}

export default GridCanvas
