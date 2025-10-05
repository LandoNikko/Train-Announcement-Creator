export const generateAudio = async (text, voiceId, apiKey) => {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error: ${error}`)
    }

    const audioBlob = await response.blob()
    return URL.createObjectURL(audioBlob)
  } catch (error) {
    console.error('Error generating audio:', error)
    throw error
  }
}
