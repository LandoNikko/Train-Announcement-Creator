import { Play, Pause, Trash2 } from 'lucide-react'

const AnnouncementCard = ({ announcement, isPlaying, onPlay, onDelete }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-800 text-sm">{announcement.station}</h4>
          <p className="text-xs text-gray-600 mt-1">{announcement.text}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => onPlay(announcement.id, announcement.audioUrl)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>
        <button
          onClick={() => onDelete(announcement.id)}
          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default AnnouncementCard
