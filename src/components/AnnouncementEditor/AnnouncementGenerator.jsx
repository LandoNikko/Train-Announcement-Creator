import { useState } from 'react'
import { X, Loader } from 'lucide-react'
import { generateAudio } from '../../utils/elevenLabsAPI'

const AnnouncementGenerator = ({ stations, apiKey, onGenerate, onClose, isGenerating, setIsGenerating }) => {
  const [selectedStation, setSelectedStation] = useState(stations[0]?.id || '')
  const [announcementText, setAnnouncementText] = useState('')
  const [voiceId, setVoiceId] = useState('21m00Tcm4TlvDq8ikWAM')

  const handleGenerate = async () => {
    if (!announcementText.trim() || !selectedStation) return

    setIsGenerating(true)
    try {
      const audioUrl = await generateAudio(announcementText, voiceId, apiKey)
      const station = stations.find(s => s.id === selectedStation)
      
      onGenerate({
        station: station.name,
        text: announcementText,
        audioUrl,
        voiceId
      })
    } catch (error) {
      alert('Failed to generate audio: ' + error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateDefaultText = () => {
    const station = stations.find(s => s.id === selectedStation)
    if (station) {
      setAnnouncementText(`Next station, ${station.name}. The doors will open on the right side.`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Generate Announcement</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Station</label>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {stations.map(station => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Announcement Text</label>
            <textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="Enter announcement text..."
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              onClick={generateDefaultText}
              className="text-xs text-blue-500 hover:underline mt-1"
            >
              Use default template
            </button>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Voice</label>
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="21m00Tcm4TlvDq8ikWAM">Rachel (Female)</option>
              <option value="29vD33N1CtxCmqQRPOHJ">Drew (Male)</option>
              <option value="EXAVITQu4vr4xnSDxMaL">Bella (Female)</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !announcementText.trim()}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <span>Generate Audio</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AnnouncementGenerator
