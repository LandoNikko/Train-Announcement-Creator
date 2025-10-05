import { line, curveCatmullRom } from 'd3-shape'
import { useEffect, useRef, useState } from 'react'

const TrainLine = ({ line: trainLine, stations }) => {
  const pathRef = useRef(null)
  const [pathLength, setPathLength] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const lineStations = trainLine.stations
    .map(id => stations.find(s => s.id === id))
    .filter(Boolean)

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength()
      setPathLength(length)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1500)
    }
  }, [lineStations])

  if (lineStations.length < 2) return null

  const pathGenerator = line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(curveCatmullRom.alpha(trainLine.tension || 0.7))

  const pathData = pathGenerator(lineStations)

  return (
    <g>
      <path
        d={pathData}
        fill="none"
        stroke={trainLine.color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />
      <path
        ref={pathRef}
        d={pathData}
        fill="none"
        stroke={trainLine.color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLength}
        strokeDashoffset={isAnimating ? pathLength : 0}
        style={{
          transition: isAnimating ? 'stroke-dashoffset 1.5s ease-in-out' : 'none'
        }}
      />
    </g>
  )
}

export default TrainLine
