import { useState } from 'react'
import { Plus, Play, Pause, X } from 'lucide-react'
import AnnouncementCard from './AnnouncementCard'
import AnnouncementGenerator from './AnnouncementGenerator'
import { useTranslation } from '../../hooks/useTranslation'

const AnnouncementPanel = ({ stations, lines, announcements, setAnnouncements, apiKey, language = 'en', isMobile, onClose }) => {
  const { t } = useTranslation(language)
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
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t('announcements')}</h2>
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowGenerator(true)}
          disabled={!apiKey || stations.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          <span>{t('generateAnnouncement')}</span>
        </button>
        {!apiKey && (
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">{t('setApiKeyToGenerate')}</p>
        )}
        {apiKey && stations.length === 0 && (
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">{t('addStationsFirst')}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {announcements.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 mt-8">
            <p>{t('noAnnouncementsYet')}</p>
            <p className="text-sm mt-2">{t('createFirstAnnouncement')}</p>
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
