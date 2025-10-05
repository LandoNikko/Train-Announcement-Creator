import { useState } from 'react'
import { Plus, Play, Pause } from 'lucide-react'
import AnnouncementCard from './AnnouncementCard'
import AnnouncementGenerator from './AnnouncementGenerator'

const AnnouncementPanel = ({ stations, lines, announcements, setAnnouncements, apiKey }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null)

  const handleAddAnnouncement = (announcement) => {
    setAnnouncements([...announcements, { ...announcement, id: `ann-${Date.now()}` }])
    setShowGenerator(false)
  }

  const handleDelete = (id) => {
    setAnnouncements(announcements.filter(a => a.id !== id))
  }

  const handlePlay = (id, audioUrl) => {
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(null)
    } else {
      setCurrentlyPlaying(id)
      const audio = new Audio(audioUrl)
      audio.onended = () => setCurrentlyPlaying(null)
      audio.play()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Announcements</h2>
        <button
          onClick={() => setShowGenerator(true)}
          disabled={!apiKey || stations.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          <span>Generate Announcement</span>
        </button>
        {!apiKey && (
          <p className="text-xs text-orange-600 mt-2">Set API key to generate announcements</p>
        )}
        {apiKey && stations.length === 0 && (
          <p className="text-xs text-orange-600 mt-2">Add stations to the map first</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {announcements.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p>No announcements yet</p>
            <p className="text-sm mt-2">Create stations and generate your first announcement</p>
          </div>
        ) : (
          announcements.map(announcement => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isPlaying={currentlyPlaying === announcement.id}
              onPlay={handlePlay}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {showGenerator && (
        <AnnouncementGenerator
          stations={stations}
          apiKey={apiKey}
          onGenerate={handleAddAnnouncement}
          onClose={() => setShowGenerator(false)}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />
      )}
    </div>
  )
}

export default AnnouncementPanel
