import { line, curveCatmullRom, curveLinear, curveCardinal } from 'd3-shape'

const TrainLine = ({ line: trainLine, stations, lineStyle = 'smooth' }) => {
  const lineStations = trainLine.stations
    .map(id => stations.find(s => s.id === id))
    .filter(Boolean)

  if (lineStations.length < 2) return null

  // Generate path based on line style
  const generatePath = () => {
    if (lineStyle === 'direct') {
      const pathGenerator = line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(curveLinear)
      return pathGenerator(lineStations)
    } else if (lineStyle === 'minimal') {
      // Create 90-degree corners with smart pathfinding to avoid self-overlap and returning paths
      let pathData = `M ${lineStations[0].x} ${lineStations[0].y}`
      
      for (let i = 1; i < lineStations.length; i++) {
        const prev = lineStations[i - 1]
        const curr = lineStations[i]
        const dx = curr.x - prev.x
        const dy = curr.y - prev.y
        
        const prevSegment = i > 1 ? lineStations[i - 2] : null
        const next = i < lineStations.length - 1 ? lineStations[i + 1] : null
        
        // If it's a diagonal, create corner with horizontal then vertical segments
        if (Math.abs(dx) > 5 && Math.abs(dy) > 5) {
          const cornerRadius = 15
          const xDir = dx > 0 ? 1 : -1
          const yDir = dy > 0 ? 1 : -1
          
          // Smart routing: prefer direction that creates less overlap and avoids returning paths
          let useHorizontalFirst = Math.abs(dx) > Math.abs(dy)
          
          // Check previous segment direction to avoid returning
          if (prevSegment) {
            const prevDx = prev.x - prevSegment.x
            const prevDy = prev.y - prevSegment.y
            
            // If coming from a horizontal line, prefer to continue in a different direction
            if (Math.abs(prevDx) > Math.abs(prevDy)) {
              // Was horizontal, prefer vertical first to avoid backtracking
              useHorizontalFirst = false
            } else if (Math.abs(prevDy) > Math.abs(prevDx)) {
              // Was vertical, prefer horizontal first to avoid backtracking
              useHorizontalFirst = true
            }
          }
          
          // Check next segment direction (higher priority to flow smoothly)
          if (next) {
            const nextDx = next.x - curr.x
            const nextDy = next.y - curr.y
            
            // If next continues in a direction, align our exit to match
            if (Math.abs(nextDy) > Math.abs(nextDx) * 1.5) {
              // Next is strongly vertical, exit horizontally
              useHorizontalFirst = true
            } else if (Math.abs(nextDx) > Math.abs(nextDy) * 1.5) {
              // Next is strongly horizontal, exit vertically
              useHorizontalFirst = false
            }
          }
          
          // Calculate turn point - use 60% split to reduce chance of returning paths
          const turnRatio = 0.6
          
          if (useHorizontalFirst) {
            // Horizontal then vertical
            const midX = prev.x + dx * turnRatio
            pathData += ` L ${midX - cornerRadius * xDir} ${prev.y}`
            pathData += ` Q ${midX} ${prev.y}, ${midX} ${prev.y + cornerRadius * yDir}`
            pathData += ` L ${midX} ${curr.y - cornerRadius * yDir}`
            pathData += ` Q ${midX} ${curr.y}, ${midX + cornerRadius * xDir} ${curr.y}`
            pathData += ` L ${curr.x} ${curr.y}`
          } else {
            // Vertical then horizontal
            const midY = prev.y + dy * turnRatio
            pathData += ` L ${prev.x} ${midY - cornerRadius * yDir}`
            pathData += ` Q ${prev.x} ${midY}, ${prev.x + cornerRadius * xDir} ${midY}`
            pathData += ` L ${curr.x - cornerRadius * xDir} ${midY}`
            pathData += ` Q ${curr.x} ${midY}, ${curr.x} ${midY + cornerRadius * yDir}`
            pathData += ` L ${curr.x} ${curr.y}`
          }
        } else {
          // Straight line for horizontal or vertical connections
          pathData += ` L ${curr.x} ${curr.y}`
        }
      }
      
      return pathData
    } else {
      const pathGenerator = line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(curveCardinal.tension(-1.0)) // Curve tension <0 = smoothness, 1 = corners
      return pathGenerator(lineStations)
    }
  }

  const pathData = generatePath()

  return (
    <g>
      <path
        d={pathData}
        fill="none"
        stroke={trainLine.color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </g>
  )
}

export default TrainLine
