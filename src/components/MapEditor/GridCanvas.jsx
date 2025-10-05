const GridCanvas = ({ spacing, viewBox }) => {
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

  return (
    <g>
      <rect
        x={viewBox.x}
        y={viewBox.y}
        width={viewBox.width}
        height={viewBox.height}
        fill="#f9fafb"
        className="pointer-events-none"
      />
      {dots.map(dot => (
        <circle
          key={dot.key}
          cx={dot.x}
          cy={dot.y}
          r="3"
          fill="#d1d5db"
          className="grid-dot cursor-pointer hover:fill-blue-400 transition-colors"
        />
      ))}
    </g>
  )
}

export default GridCanvas
