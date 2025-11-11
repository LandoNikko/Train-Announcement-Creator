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
        text: `[whispers] ${text}`,
        model_id: 'eleven_v3',
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

export const generateSoundEffect = async (text, apiKey, options = {}) => {
  const url = 'https://api.elevenlabs.io/v1/sound-generation'
  
  const {
    loop = false,
    durationSeconds = null,
    promptInfluence = 0.3,
    modelId = 'eleven_text_to_sound_v2',
    outputFormat = 'mp3_44100_128'
  } = options

  try {
    const body = {
      text,
      loop,
      prompt_influence: promptInfluence,
      model_id: modelId
    }
    
    // Only add duration if specified
    if (durationSeconds !== null) {
      body.duration_seconds = durationSeconds
    }

    const response = await fetch(`${url}?output_format=${outputFormat}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error: ${error}`)
    }

    const audioBlob = await response.blob()
    return URL.createObjectURL(audioBlob)
  } catch (error) {
    console.error('Error generating sound effect:', error)
    throw error
  }
}