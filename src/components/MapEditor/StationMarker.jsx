const StationMarker = ({ station, isSelected, onClick }) => {
  return (
    <g onClick={onClick} className="cursor-pointer">
      <circle
        cx={station.x}
        cy={station.y}
        r="8"
        fill={isSelected ? '#fbbf24' : station.color}
        stroke="white"
        strokeWidth="2"
        className="transition-all hover:r-10"
      />
      <circle
        cx={station.x}
        cy={station.y}
        r="3"
        fill="white"
      />
      <text
        x={station.x}
        y={station.y - 15}
        textAnchor="middle"
        className="text-xs font-medium fill-gray-700 pointer-events-none select-none"
        style={{ fontSize: '12px' }}
      >
        {station.name}
      </text>
    </g>
  )
}

export default StationMarker
